const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {
	applyCountAndDelayAndActions,
	applyUntilCondition,
} = require('../utils/chainUtils');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');

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
	invalidInputMessage,
	positionIsMalformed,
} = require('../texts');
const SuitestError = require('../utils/SuitestError');

const positionFactory = (classInstance) => {
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
	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
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
				x: validate(validators.ST_VAR_NOT_NEGATIVE_NUMBER, x, invalidInputMessage('position', 'Position x')),
				y: validate(validators.ST_VAR_NOT_NEGATIVE_NUMBER, y, invalidInputMessage('position', 'Position y')),
			},
		});
	};

	return {
		position: positionChain,
		positionAssert: (x, y) => positionChain(x, y).toAssert(),

		// For testing
		toJSON,
	};
};

module.exports = positionFactory;
