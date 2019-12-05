// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {isDefNegated, getPureComparatorType} = require('../utils/chainUtils');
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
	brightScriptExpressionGet,
	brightScriptStringComparator,
	invalidInputMessage,
	'errorType.syntaxError.modifierMissing': modifierMissing,
} = require('../texts');
const {
	SUBJ_COMPARATOR_HR_N,
	SUBJ_COMPARATOR_HR,
} = require('../mappings');
const {validate, validators} = require('../validation');
const {
	processServerResponse,
	getRequestType,
	applyTimeout,
	applyNegation,
} = require('../utils/socketChainHelper');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

// TODO(SUIT-14046) remove after socketChainHelper.js, socketErrorMessages.js refactoring
const toString = data => {
	const {comparator, expression} = data;

	if (!comparator) {
		return brightScriptExpressionGet(String(expression));
	}

	const map = data.isNegated ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;
	const {val, type} = comparator;

	return brightScriptStringComparator(map[type], val, expression);
};

const toString2 = (jsonMessage) => {
	if (jsonMessage.type === 'query' && jsonMessage.subject.type === 'brightscript') {
		return brightScriptExpressionGet(jsonMessage.subject.execute);
	}

	const jsonDef = jsonMessage;
	const comparatorType = getPureComparatorType(jsonDef);
	const comparatorsMap = isDefNegated(jsonDef) ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;
	const bsExpression = jsonDef.condition.subject.val;

	return brightScriptStringComparator(
		comparatorsMap[comparatorType],
		jsonDef.condition.val,
		bsExpression,
	);
};

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};

	if (type === 'query') {
		socketMessage.subject = {
			type: 'brightscript',
			execute: data.expression,
		};
	} else {
		// assert brightScriptExpression chain without comparator
		if (!data.comparator)
			throw new SuitestError(modifierMissing('brightScriptExpression() assertion'), SuitestError.INVALID_INPUT);

		socketMessage.request = applyTimeout({
			type: 'assert',
			condition: {
				subject: {
					type: 'brightscript',
					val: data.expression,
				},
				type: applyNegation(data.comparator.type, data),
				val: data.comparator.val,
			},
		}, data);
	}

	return socketMessage;
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

// Build Composers
const toStringComposer = makeToStringComposer(toString2, toJSON);
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
const brightScriptExpressionChain = brightScriptCode => makeChain(getComposers, {
	type: 'brightScriptExpression',
	expression: validate(
		validators.NON_EMPTY_STRING,
		brightScriptCode,
		invalidInputMessage('brightScriptExpression', 'BrightScript expression')
	),
});

module.exports = {
	brightScriptExpression: brightScriptExpressionChain,
	brightScriptExpressionAssert: brightScriptCode => brightScriptExpressionChain(brightScriptCode).toAssert(),

	// For testing
	toJSON,
	beforeSendMsg,
};
