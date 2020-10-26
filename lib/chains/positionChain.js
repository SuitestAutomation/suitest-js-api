const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {
	processJsonMessageForToString,
	applyCountAndDelayAndActions,
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
	tapComposer,
	swipeComposer,
	scrollComposer,
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
	positionTap,
	positionScroll,
	positionSwipe,
	positionMoveTo,
	invalidInputMessage,
	positionIsMalformed,
} = require('../texts');
const getOpType = require('../utils/opType').getOpType;
const SuitestError = require('../utils/SuitestError');

const positionFactory = (classInstance) => {
	const {logger} = classInstance;
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
		} else if (jsonDef.type === 'tap') {
			out = positionTap(jsonDef.taps[0].type, coordinates.x, coordinates.y);

			if (jsonDef.count) {
				out += chainRepeat(jsonDef.count, jsonDef.delay);
			}
		} else if (jsonDef.type === 'scroll') {
			const {direction, distance} = jsonDef.scroll[0];

			out = positionScroll(coordinates.x, coordinates.y, direction, distance);

			if (jsonDef.count) {
				out += chainRepeat(jsonDef.count, jsonDef.delay);
			}
		} else if (jsonDef.type === 'swipe') {
			const {direction, distance, duration} = jsonDef.swipe[0];

			out = positionSwipe(coordinates.x, coordinates.y, direction, distance, duration);

			if (jsonDef.count) {
				out += chainRepeat(jsonDef.count, jsonDef.delay);
			}
		}

		return out;
	};
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data),
	);

	const toJSON = (data) => {
		if (!data.isClick && !data.isMoveTo && !data.tap && !data.isSwipe && !data.isScroll) {
			throw new SuitestError(positionIsMalformed(), SuitestError.INVALID_INPUT);
		}

		let lineType;

		if (data.isClick) {
			lineType = 'click';
		} else if (data.tap) {
			lineType = 'tap';
		} else if (data.isSwipe) {
			lineType = 'swipe';
		} else if (data.isScroll) {
			lineType = 'scroll';
		} else {
			lineType = 'moveTo';
		}

		const socketMessage = {
			type: getRequestType(data, false),
			request: {
				type: lineType,
				target: {
					type: (data.tap || data.isScroll || data.isSwipe) ? 'screen' : 'window',
					coordinates: data.coordinates,
				},
			},
		};

		if (lineType === 'click' || lineType === 'tap' || lineType === 'scroll' || lineType === 'swipe') {
			socketMessage.request = compose(
				msg => applyUntilCondition(msg, data),
				msg => applyCountAndDelayAndActions(msg, data),
			)({...socketMessage.request});
		}

		return socketMessage;
	};

	// Build Composers
	const toStringComposer = makeToStringComposer(toString, toJSON);
	const thenComposer = makeThenComposer(toJSON, processServerResponse(logger, toString), beforeSendMsg);
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

		if (!data.isClick && !data.isMoveTo && !data.tap && !data.isScroll && !data.isSwipe) {
			output.push(clickComposer, moveToComposer, tapComposer, scrollComposer, swipeComposer);
		}

		if (data.isClick || data.tap || data.isScroll || data.isSwipe) {
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
		return makeChain(classInstance, getComposers, {
			type: 'position',
			coordinates: {
				x: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, x, invalidInputMessage('position', 'Position x')),
				y: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, y, invalidInputMessage('position', 'Position y')),
			},
		});
	};

	return {
		position: positionChain,
		positionAssert: (x, y) => positionChain(x, y).toAssert(),

		// For testing
		toJSON,
		beforeSendMsg,
	};
};

module.exports = positionFactory;
