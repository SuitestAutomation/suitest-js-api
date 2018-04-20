const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');

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
const {VRC} = require('../mappings');
const {validate, validators} = require('../validataion');
const {
	processServerResponse,
	getRequestType,
	applyCountAndDelay,
	applyUntilCondition,
} = require('../utils/socketChainHelper');

const mapIds = ids => ids.map(id => VRC[id]);

const toString = data => {
	const ids = mapIds(data.ids);
	const repeat = data.repeat;
	const interval = data.interval;
	let out = pressButton(ids.join(', '), ids.length > 1 ? 's' : '');

	if (repeat) {
		out += chainRepeat(repeat, interval || 500);
	}

	return out;
};

const toJSON = (data) => ({
	type: getRequestType(data, false),
	request: compose(
		msg => applyUntilCondition(msg, data),
		msg => applyCountAndDelay(msg, data),
	)({
		type: 'button',
		ids: mapIds(data.ids),
	}),
});

const toStringComposer = makeToStringComposer(toString);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString));
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

	return makeChain(getComposers, {
		type: 'press',
		ids: validate(validators.ARRAY_OF_SYMBOLS, ids, invalidInputMessage('pressButton', 'Illegal	button ids.')),
	});
};

module.exports = {
	pressButton: pressButtonChain,
	pressButtonAssert: buttonOrButtons => pressButtonChain(buttonOrButtons).toAssert(),

	// For testing
	toJSON,
};
