// Import helpers and composers
const {compose} = require('ramda');
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
} = require('../mappings');
const {validate, validators} = require('../validation');
const {
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const logger = require('../utils/logger');
const {
	isDefNegated,
	getPureComparatorType,
	processJsonMessageForToString,
	applyTimeout,
	applyNegation,
} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;

const javascriptExpressionFactory = (classInstance) => {
	const toString = (jsonMessage) => {
		if (jsonMessage.type === 'query') {
			return jsExpressionGet(String(jsonMessage.subject.execute));
		}

		const def = processJsonMessageForToString(jsonMessage);
		const map = isDefNegated(def) ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;
		const comparatorType = getPureComparatorType(def);

		return jsExpressionStringComparator(
			map[comparatorType], // human readable comparator representation
			def.condition.val, // result value for comparing
			def.condition.subject.val, // javascript expression for evaluation
		);
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
					type: applyNegation(data.comparator.type, data),
					val: data.comparator.val,
				},
			}, data);
		}

		return socketMessage;
	};
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data),
	);

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
	const jsExpressionChain = jsOrString => makeChain(classInstance, getComposers, {
		type: 'jsExpression',
		expression: validate(
			validators.NON_EMPTY_STRING,
			parseJS(jsOrString),
			invalidInputMessage('jsExpression', 'JavaScript expression')
		),
	});

	return {
		jsExpression: jsExpressionChain,
		jsExpressionAssert: jsOrString => jsExpressionChain(jsOrString).toAssert(),

		// For testing
		toJSON,
		beforeSendMsg,
	};
};

module.exports = javascriptExpressionFactory;
