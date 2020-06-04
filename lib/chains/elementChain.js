const {omit, compose, clone, isNil, has} = require('ramda');
const util = require('util');

// Import utils
const makeChain = require('../utils/makeChain');

// Import chain composers
const {
	clickComposer,
	notComposer,
	existComposer,
	matchComposer,
	matchRepoComposer,
	matchJSComposer,
	// matchBrightScriptComposer,
	timeoutComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	repeatComposer,
	intervalComposer,
	moveToComposer,
	sendTextComposer,
	setTextComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
	untilComposer,
	visibleComposer,
} = require('../composers');
const {
	element,
	elementClick,
	chainRepeat,
	elementMoveTo,
	elementSendText,
	elementSetText,
	invalidInputMessage,
	warnVideoAsElementDeprecation,
} = require('../texts');
const {validate, validators} = require('../validation');
const {
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const {
	SUBJ_COMPARATOR: SUBJ_COMPARATOR_M,
} = require('../mappings');
const logger = require('../utils/logger');
const {
	elementWithConditionToString,
	elementWithComparatorToJSON,
	processJsonMessageForToString,
	applyCountAndDelay,
	applyCountAndDelayAndClicks,
	applyUntilCondition,
} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;
const {video} = require('./videoChain');

/**
 * Returns human readable description of the element chain.
 * @param jsonMessage - socket json message or command line json representation
 * @param nameOnly - if true only element name will be returned (like: {"apiId" : "boo"})
 * @returns {*}
 */
const toString = (jsonMessage, nameOnly = false) => {
	const transformSelectorForTitle = (selector) => {
		const resSelector = clone(selector);

		if (has('ifMultipleFoundReturn', resSelector)) {
			resSelector.index = resSelector.ifMultipleFoundReturn;
			delete resSelector.ifMultipleFoundReturn;
		}

		return resSelector;
	};

	if (jsonMessage.type === 'query') {
		const elName = jsonMessage.subject.selector.apiId
			|| compose(JSON.stringify, transformSelectorForTitle, omit(['apiId']))(jsonMessage.subject.selector);

		return nameOnly ? elName : element(elName);
	}

	const def = processJsonMessageForToString(jsonMessage);
	// get element info based on type - if it is 'assert' or 'wait' it will be recognized as "element matching" and will look to the condition.subject
	// otherwise element info will be took from target prop as for click, moveTo, sendText, setText
	const elementInfo = ['assert', 'wait'].includes(def.type) ? def.condition.subject : def.target;
	// getting element name: api id or selectors
	const elName = elementInfo.apiId || compose(JSON.stringify, transformSelectorForTitle)(elementInfo.val);

	if (nameOnly) {
		return elName;
	}

	let out = element(elName);

	if (['assert', 'wait'].includes(def.type) && def.condition.subject.type === 'element') {
		out = elementWithConditionToString(def, elName);
	} else if (def.type === 'click') {
		out = elementClick(elName);
	} else if (def.type === 'moveTo') {
		out = elementMoveTo(elName);
	} else if (def.type === 'sendText') {
		out = elementSendText(def.val, elName);
	} else if (def.type === 'setText') {
		out = elementSetText(def.val, elName);
	}

	if (def.count) {
		out += chainRepeat(def.count, def.delay);
	}

	return out;
};

const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	compose(toString, toJSON)(data),
);

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};
	const subject = {
		type: 'element',
	};
	const apiId = data.selector.apiId;
	const selectors = omit(['apiId'], data.selector);

	if (has('index', selectors)) {
		selectors.ifMultipleFoundReturn = selectors.index;
		delete selectors.index;
	}

	if (apiId) {
		subject.apiId = apiId; // not yet supported by network api
	} else {
		subject.val = selectors;
	}

	// query
	if (type === 'query') {
		socketMessage.subject = {
			type: 'elementProps',
			selector: apiId ? data.selector : selectors,
		};
	}

	// click
	if (data.isClick) {
		socketMessage.request = compose(
			msg => applyUntilCondition(msg, data),
			msg => applyCountAndDelayAndClicks(msg, data),
		)({
			type: 'click',
			target: subject,
		});
	}

	// moveTo
	if (data.isMoveTo) {
		socketMessage.request = {
			type: 'moveTo',
			target: subject,
		};
	}

	// send text
	if (!isNil(data.sendText)) {
		socketMessage.request = compose(
			msg => applyUntilCondition(msg, data),
			msg => applyCountAndDelay(msg, data),
		)({
			type: 'sendText',
			target: subject,
			val: data.sendText,
		});
	}

	// set text
	if (!isNil(data.setText)) {
		socketMessage.request = {
			type: 'setText',
			target: subject,
			val: data.setText,
		};
	}

	// element subject
	if (data.comparator) {
		socketMessage.request = elementWithComparatorToJSON(data, subject);
	}

	return socketMessage;
};

// Build Composers
const toStringComposer = makeToStringComposer(toString, toJSON);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString), beforeSendMsg);
const toJSONComposer = makeToJSONComposer(toJSON);

/**
 * Function accepts data object of future chain as input
 * and returns a list of composers that should build the chain
 * @param data
 * @returns {*[]}
 */
const getComposers = (data) => {
	const output = [
		toStringComposer,
		thenComposer,
		cloneComposer,
		gettersComposer,
		toJSONComposer,
	];

	const comparatorType = data.comparator && data.comparator.type;
	const isMatchesComparator = comparatorType === SUBJ_COMPARATOR_M.MATCH
		|| comparatorType === SUBJ_COMPARATOR_M.MATCH_JS
		|| comparatorType === SUBJ_COMPARATOR_M.MATCH_BRS;

	const isVisibleComparator = comparatorType === SUBJ_COMPARATOR_M.VISIBLE;

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isNegated
		&& !data.isClick
		&& !data.isMoveTo
		&& isNil(data.sendText)
		&& isNil(data.setText)
		&& !isMatchesComparator
		&& !isVisibleComparator
	) {
		output.push(notComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (
		!data.timeout
		&& !data.isClick
		&& !data.isMoveTo
		&& isNil(data.sendText)
		&& isNil(data.setText)
	) {
		output.push(timeoutComposer);
	}

	if (
		!data.comparator
		&& !data.isClick
		&& !data.isMoveTo
		&& isNil(data.sendText)
		&& isNil(data.setText)
	) {
		output.push(existComposer);
		if (!data.isNegated) {
			output.push(
				visibleComposer, matchComposer, matchRepoComposer, matchJSComposer,
				// matchBrightScriptComposer
			);
		}
	}

	if (
		!data.comparator
		&& !data.isClick
		&& !data.isMoveTo
		&& isNil(data.sendText)
		&& isNil(data.setText)
		&& !data.isNegated
	) {
		output.push(
			clickComposer,
			moveToComposer,
			sendTextComposer,
			setTextComposer
		);
	}

	if (data.isClick || !isNil(data.sendText)) {
		if (!data.interval) {
			output.push(intervalComposer);
		}

		if (!data.repeat) {
			output.push(repeatComposer);
		}

		if (!data.until) {
			output.push(untilComposer);
		}
	}

	return output;
};

const deprecatedVideo = util.deprecate(video, warnVideoAsElementDeprecation());

const elementChain = elementSelector => {
	const selector = typeof elementSelector === 'string' ? {apiId: elementSelector} : elementSelector;

	if (selector && selector.video && Object.keys(selector).length === 1) {
		return deprecatedVideo();
	}

	return makeChain(getComposers, {
		type: 'element',
		selector: validate(validators.ELEMENT_SELECTOR, selector, invalidInputMessage('element', 'Element selector')),
	});
};

module.exports = {
	element: elementChain,
	elementAssert: elementSelector => elementChain(elementSelector).toAssert(),

	// For testing
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
};
