const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {processJsonMessageForToString, applyCountAndDelay, applyUntilCondition} = require('../utils/chainUtils');
const {
	repeatComposer,
	intervalComposer,
	abandonComposer,
	makeThenComposer,
	makeToStringComposer,
	cloneComposer,
	gettersComposer,
	assertComposer,
	makeToJSONComposer,
	untilComposer,
} = require('../composers');
const {
	pressButton,
	chainRepeat,
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const getOpType = require('../utils/opType').getOpType;

const pressButtonFactory = (classInstance) => {
	const {logger} = classInstance;
	const toString = (jsonMessage) => {
		const jsonDef = processJsonMessageForToString(jsonMessage);
		const {ids, count, delay} = jsonDef;
		let out = pressButton(ids.join(', '), ids.length > 1 ? 's' : '');

		if (count) {
			out += chainRepeat(count, delay);
		}

		return out;
	};
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data),
	);

	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: compose(
			msg => applyUntilCondition(msg, data),
			msg => applyCountAndDelay(msg, data),
		)({
			type: 'button',
			ids: data.ids,
		}),
	});

	const toStringComposer = makeToStringComposer(toString, toJSON);
	const thenComposer = makeThenComposer(toJSON, processServerResponse(logger, toString), beforeSendMsg);
	const toJSONComposer = makeToJSONComposer(toJSON);

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

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.interval) {
			output.push(intervalComposer);
		}

		if (!data.repeat) {
			output.push(repeatComposer);
		}

		if (!data.until) {
			output.push(untilComposer);
		}

		return output;
	};

	const pressButtonChain = buttonOrButtons => {
		const ids = Array.isArray(buttonOrButtons) ? buttonOrButtons : [buttonOrButtons];

		return makeChain(classInstance, getComposers, {
			type: 'press',
			ids: validate(validators.ARRAY_OF_BUTTONS, ids, invalidInputMessage('pressButton', 'Illegal button ids.')),
		});
	};

	return {
		pressButton: pressButtonChain,
		pressButtonAssert: buttonOrButtons => pressButtonChain(buttonOrButtons).toAssert(),

		// For testing
		toJSON,
		beforeSendMsg,
	};
};

module.exports = pressButtonFactory;
