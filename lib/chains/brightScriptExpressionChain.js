// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	applyTimeout,
	applyNegation,
} = require('../utils/chainUtils');
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
	invalidInputMessage,
	'errorType.syntaxError.modifierMissing': modifierMissing,
} = require('../texts');
const {validate, validators} = require('../validation');
const {
	getRequestType,
} = require('../utils/socketChainHelper');

const brightScriptExpressionFactory = (classInstance) => {
	const {logger} = classInstance;

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
				throw new SuitestError(
					modifierMissing('brightScriptExpression() assertion'),
					SuitestError.INVALID_INPUT,
				);

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
			}, data, classInstance.config.defaultTimeout);
		}

		return socketMessage;
	};

	// Build Composers
	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
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
	const brightScriptExpressionChain = brightScriptCode => makeChain(classInstance, getComposers, {
		type: 'brightScriptExpression',
		expression: validate(
			validators.NON_EMPTY_STRING,
			brightScriptCode,
			invalidInputMessage('brightScriptExpression', 'BrightScript expression'),
		),
	});

	return {
		brightScriptExpression: brightScriptExpressionChain,
		brightScriptExpressionAssert: brightScriptCode => brightScriptExpressionChain(brightScriptCode).toAssert(),

		// For testing
		toJSON,
	};
};

module.exports = brightScriptExpressionFactory;
