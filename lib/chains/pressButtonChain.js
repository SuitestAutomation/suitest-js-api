const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {applyCountAndDelay, applyUntilCondition} = require('../utils/chainUtils');
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
const {invalidInputMessage} = require('../texts');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');

const pressButtonFactory = (classInstance) => {
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

	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
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
	};
};

module.exports = pressButtonFactory;
