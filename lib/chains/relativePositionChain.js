const {compose} = require('ramda');
// Import utils
const makeChain = require('../utils/makeChain');
const {applyCountAndDelayAndActions, applyUntilCondition} = require('../utils/chainUtils');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');
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
const {invalidInputMessage, relativePositionIsMalformed} = require('../texts');
const SuitestError = require('../utils/SuitestError');

/**
 * @param {SUITEST_API} classInstance
 */
const relativePositionFactory = (classInstance) => {
	const toJSON = (data) => {
		if (!data.isClick && !data.isMoveTo) {
			throw new SuitestError(relativePositionIsMalformed(), SuitestError.INVALID_INPUT);
		}

		const lineType = data.isClick ? 'click' : 'moveTo';
		const socketMessage = {
			type: getRequestType(data, false),
			request: {
				type: lineType,
				target: {
					type: 'window',
					coordinates: data.coordinates,
					relative: true,
				},
			},
		};

		if (lineType === 'click') {
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
	 * Define relative position
	 * @param {number | string} x - horizontal position
	 * @param {number | string} y - vertical position
	 */
	const relativePositionChain = (x, y) => {
		return makeChain(classInstance, getComposers, {
			type: 'position',
			coordinates: {
				x: validate(validators.ST_VAR_OR_NUMBER, x, invalidInputMessage('relativePosition', 'Position x')),
				y: validate(validators.ST_VAR_OR_NUMBER, y, invalidInputMessage('relativePosition', 'Position y')),
			},
		});
	};

	return {
		// relativePosition functions
		relativePosition: relativePositionChain,
		relativePositionAssert: (x, y) => relativePositionChain(x, y).toAssert(),

		// For testing
		toJSON,
	};
};

module.exports = relativePositionFactory;
