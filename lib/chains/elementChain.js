const {omit, isNil, compose} = require('ramda');

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
	timeoutComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	repeatComposer,
	intervalComposer,
	moveToComposer,
	sendTextComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
	untilComposer,
} = require('../composers');
const {
	element,
	elementExist,
	elementNotExist,
	elementMatchProps,
	elementMatchJS,
	elementNotMatchJS,
	elementClick,
	chainRepeat,
	elementMoveTo,
	elementSendText,
	invalidInputMessage,
	chainIsAboutToBeExecuted,
} = require('../texts');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {validate, validators} = require('../validataion');
const {
	processServerResponse,
	getRequestType,
	applyTimeout,
	applyCountAndDelay,
	applyNegation,
	applyCountAndDelayAndClicks,
	applyUntilCondition,
} = require('../utils/socketChainHelper');
const {
	PROP_COMPARATOR: PROP_COMPARATOR_M,
	ELEMENT_PROP,
	SUBJ_COMPARATOR: SUBJ_COMPARATOR_M,
	ELEMENT_VALUES,
} = require('../mappings');
const {VALUE} = require('../constants/element');
const logger = require('../utils/logger');

const toString = data => {
	let elName;

	switch (true) {
		case !!data.selector.apiId:
			elName = data.selector.apiId;
			break;
		case data.selector.video && Object.keys(data.selector).length === 1:
			elName = 'video';
			break;
		default:
			elName = JSON.stringify(data.selector);
			break;
	}

	let out = element(elName);

	if (data.comparator) {
		switch (data.comparator.type) {
			case SUBJ_COMPARATOR.EXIST:
				out = (data.isNegated ? elementNotExist : elementExist)(elName);
				break;
			case SUBJ_COMPARATOR.MATCH_JS:
				out = (data.isNegated ? elementNotMatchJS : elementMatchJS)(elName);
				break;
			default:
				out = elementMatchProps(elName);
		}
	} else if (data.isClick) {
		out = elementClick(elName);
	} else if (data.isMoveTo) {
		out = elementMoveTo(elName);
	} else if (data.sendText) {
		out = elementSendText(data.sendText, elName);
	}

	if (data.repeat) {
		out += chainRepeat(data.repeat, data.interval);
	}

	return out;
};
const beforeSendMsg = (data) => logger.info(chainIsAboutToBeExecuted('element(...)', toString(data)));

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

	// element subject
	if (data.comparator) {
		socketMessage.request = applyTimeout({
			type: 'assert',
			condition: {subject},
		}, data);

		socketMessage.request.condition.type = applyNegation(SUBJ_COMPARATOR_M[data.comparator.type], data);

		// match js
		if (data.comparator.type === SUBJ_COMPARATOR.MATCH_JS) {
			socketMessage.request.condition.val = data.comparator.val;
		}
		// match props
		if (data.comparator.type === SUBJ_COMPARATOR.MATCH) {
			socketMessage.request.condition.expression = data.comparator.props.map(prop => {
				const out = {
					property: ELEMENT_PROP[prop.name],
					type: PROP_COMPARATOR_M[prop.type],
				};

				if (prop.val === VALUE.REPO) {
					out.inherited = true;
				} else {
					out.val = typeof prop.val === 'symbol' ? ELEMENT_VALUES[prop.name][prop.val] : prop.val;
				}

				if (!isNil(prop.deviation)) {
					out.deviation = prop.deviation;
				}

				return out;
			});
		}
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
	const isMatchesComparator = comparatorType === SUBJ_COMPARATOR_M.matches
		|| comparatorType === SUBJ_COMPARATOR_M.has;

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isNegated && !data.isClick && !data.isMoveTo && !data.sendText && !isMatchesComparator) {
		output.push(notComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.timeout && !data.isClick && !data.isMoveTo && !data.sendText) {
		output.push(timeoutComposer);
	}

	if (!data.comparator && !data.isClick && !data.isMoveTo && !data.sendText) {
		output.push(existComposer);
		if (!data.isNegated) {
			output.push(matchComposer, matchRepoComposer, matchJSComposer);
		}
	}

	if (!data.comparator && !data.isClick && !data.isMoveTo && !data.sendText && !data.isNegated) {
		output.push(clickComposer, moveToComposer, sendTextComposer);
	}

	if (data.isClick || data.sendText) {
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

const elementChain = elementSelector => {
	const selector = typeof elementSelector === 'string' ? {apiId: elementSelector} : elementSelector;

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
