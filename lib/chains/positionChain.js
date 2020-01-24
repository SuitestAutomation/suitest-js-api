const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {
	processJsonMessageForToString,
	applyCountAndDelayAndClicks,
	applyUntilCondition,
} = require('../utils/chainUtils');
const {validate, validators} = require('../validation');
const {
	processServerResponse,
	getRequestType,
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
	positionIsMalformed,
} = require('../texts');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;
const SuitestError = require('../utils/SuitestError');

const toString = (jsonMessage) => {
	const jsonDef = processJsonMessageForToString(jsonMessage);
	const {coordinates} = jsonDef.target;
	let out = position(coordinates.x, coordinates.y);

	if (jsonDef.type === 'click') {
		out = positionClick(coordinates.x, coordinates.y);

		if (jsonDef.count) {
			out += chainRepeat(jsonDef.count, jsonDef.delay);
		}
	} else if (jsonDef.type === 'moveTo') {
		out = positionMoveTo(coordinates.x, coordinates.y);
	}

	return out;
};
const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	compose(toString, toJSON)(data),
);

const toJSON = (data) => {
	if (!data.isClick && !data.isMoveTo) {
		throw new SuitestError(positionIsMalformed(), SuitestError.INVALID_INPUT);
	}

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
const toStringComposer = makeToStringComposer(toString, toJSON);
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
			x: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, x, invalidInputMessage('position', 'Position x')),
			y: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, y, invalidInputMessage('position', 'Position y')),
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
