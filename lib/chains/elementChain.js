const {omit, compose} = require('ramda');
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
const {validate, validators} = require('../validataion');
const {
	processServerResponse,
	getRequestType,
	applyCountAndDelay,
	applyCountAndDelayAndClicks,
	applyUntilCondition,
} = require('../utils/socketChainHelper');
const {
	SUBJ_COMPARATOR: SUBJ_COMPARATOR_M,
} = require('../mappings');
const logger = require('../utils/logger');
const {elementWithComparatorToString, elementWithComparatorToJSON} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;
const {video} = require('./videoChain');

/**
 * Returns human readable description of the element chain.
 * @param data - chain data
 * @param nameOnly - if true only element name will be returned (like: {"apiId" : "boo"})
 * @returns {*}
 */
const toString = (data, nameOnly = false) => {
	let elName;

	if (data.selector.apiId) {
		elName = data.selector.apiId;
	} else {
		elName = JSON.stringify(data.selector);
	}

	if (nameOnly)
		return data.selector.apiId? `"${elName}"` : elName;

	let out = element(elName);

	if (data.comparator) {
		out = elementWithComparatorToString(data, elName);
	} else if (data.isClick) {
		out = elementClick(elName);
	} else if (data.isMoveTo) {
		out = elementMoveTo(elName);
	} else if (data.sendText) {
		out = elementSendText(data.sendText, elName);
	} else if (data.setText) {
		out = elementSetText(data.setText, elName);
	}

	if (data.repeat) {
		out += chainRepeat(data.repeat, data.interval);
	}

	return out;
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};
	const subject = {
		type: 'element',
	};
	const apiId = data.selector.apiId;
	const selectors = omit(['apiId'], data.selector);

	if (selectors.hasOwnProperty('index')) {
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
			selector: data.selector,
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
	if (data.sendText) {
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
	if (data.setText) {
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
const toStringComposer = makeToStringComposer(toString);
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

	if (!data.isNegated && !data.isClick && !data.isMoveTo && !data.sendText && !data.setText && !isMatchesComparator && !isVisibleComparator) {
		output.push(notComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.timeout && !data.isClick && !data.isMoveTo && !data.sendText && !data.setText) {
		output.push(timeoutComposer);
	}

	if (!data.comparator && !data.isClick && !data.isMoveTo && !data.sendText && !data.setText) {
		output.push(existComposer);
		if (!data.isNegated) {
			output.push(
				visibleComposer, matchComposer, matchRepoComposer, matchJSComposer,
				// matchBrightScriptComposer
			);
		}
	}

	if (!data.comparator && !data.isClick && !data.isMoveTo && !data.sendText && !data.setText && !data.isNegated) {
		output.push(
			clickComposer,
			moveToComposer,
			sendTextComposer,
			setTextComposer
		);
	}

	if (data.isClick || data.sendText || data.setText) {
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
