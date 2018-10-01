// Import helpers and composers
const parseJS = require('../utils/parseJS');
const makeChain = require('../utils/makeChain');
const SuitestError = require('../utils/SuitestError');
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	notComposer,
	equalComposer,
	containComposer,
	startWithComposer,
	endWithComposer,
	timeoutComposer,
	gettersComposer,
	assertComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	jsExpressionGet,
	jsExpressionStringComparator,
	invalidInputMessage,
	'errorType.syntaxError.modifierMissing': modifierMissing,
} = require('../texts');
const {
	SUBJ_COMPARATOR_HR_N,
	SUBJ_COMPARATOR_HR,
	SUBJ_COMPARATOR,
} = require('../mappings');
const {validate, validators} = require('../validataion');
const {
	processServerResponse,
	getRequestType,
	applyTimeout,
	applyNegation,
} = require('../utils/socketChainHelper');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

const toString = data => {
	const {comparator, expression} = data;

	if (!comparator) {
		return jsExpressionGet(String(expression));
	}

	const map = data.isNegated ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;
	const {val, type} = comparator;

	return jsExpressionStringComparator(map[type], val, expression);
};

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};

	if (type === 'query') {
		socketMessage.subject = {
			type: 'execute',
			execute: data.expression,
		};
	} else {
		// assert jsExpression chain without comparator
		if (!data.comparator)
			throw new SuitestError(modifierMissing('jsExpression() assertion'), SuitestError.INVALID_INPUT);

		socketMessage.request = applyTimeout({
			type: 'assert',
			condition: {
				subject: {
					type: 'javascript',
					val: data.expression,
				},
				type: applyNegation(SUBJ_COMPARATOR[data.comparator.type], data),
				val: data.comparator.val,
			},
		}, data);
	}

	return socketMessage;
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

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
const getComposers = data => {
	const output = [
		toStringComposer,
		thenComposer,
		cloneComposer,
		gettersComposer,
		toJSONComposer,
	];

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isNegated) {
		output.push(notComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (isNaN(data.timeout)) {
		output.push(timeoutComposer);
	}

	if (!data.comparator) {
		output.push(equalComposer, containComposer, startWithComposer, endWithComposer);
	}

	return output;
};

// Chain builder functions
const jsExpressionChain = jsOrString => makeChain(getComposers, {
	type: 'jsExpression',
	expression: validate(
		validators.NON_EMPTY_STRING,
		parseJS(jsOrString),
		invalidInputMessage('jsExpression', 'JavaScript expression')
	),
});

module.exports = {
	jsExpression: jsExpressionChain,
	jsExpressionAssert: jsOrString => jsExpressionChain(jsOrString).toAssert(),

	// For testing
	toJSON,
	beforeSendMsg,
};
