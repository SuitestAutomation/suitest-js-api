const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {validate, validators} = require('../validataion');
const {
	processServerResponse,
	getRequestType,
	applyCountAndDelayAndClicks,
	applyUntilCondition,
} = require('../utils/socketChainHelper');

// Import chain composers
const {
	clickComposer,
	moveToComposer,
	repeatComposer,
	intervalComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	gettersComposer,
	assertComposer,
	makeToJSONComposer,
	untilComposer,
} = require('../composers');
const {
	chainRepeat,
	position,
	positionClick,
	positionMoveTo,
	invalidInputMessage,
	chainIsAboutToBeExecuted,
} = require('../texts');
const logger = require('../utils/logger');

const toString = data => {
	let out = position(data.coordinates.x, data.coordinates.y);

	if (data.isClick) {
		out = positionClick(data.coordinates.x, data.coordinates.y);

		if (data.repeat) {
			out += chainRepeat(data.repeat, data.interval);
		}
	} else if (data.isMoveTo) {
		out = positionMoveTo(data.coordinates.x, data.coordinates.y);
	}

	return out;
};
const beforeSendMsg = (data) => logger.info(chainIsAboutToBeExecuted(`position(${JSON.stringify(data.coordinates)})`, toString(data)));

const toJSON = (data) => {
	const lineType = data.isClick ? 'click' : 'moveTo';
	const socketMessage = {
		type: getRequestType(data, false),
		request: {
			type: lineType,
			target: {
				type: 'window',
				coordinates: data.coordinates,
			},
		},
	};

	if (lineType === 'click') {
		socketMessage.request = compose(
			msg => applyUntilCondition(msg, data),
			msg => applyCountAndDelayAndClicks(msg, data),
		)({...socketMessage.request});
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

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.isClick && !data.isMoveTo) {
		output.push(clickComposer, moveToComposer);
	}

	if (data.isClick) {
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

/**
 * Define position subject
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 */
const positionChain = (x, y) => {
	return makeChain(getComposers, {
		type: 'position',
		coordinates: {
			x: validate(validators.POSITIVE_NUMBER, x, invalidInputMessage('position', 'Position x')),
			y: validate(validators.POSITIVE_NUMBER, y, invalidInputMessage('position', 'Position y')),
		},
	});
};

module.exports = {
	position: positionChain,
	positionAssert: (x, y) => positionChain(x, y).toAssert(),

	// For testing
	toJSON,
	beforeSendMsg,
};
