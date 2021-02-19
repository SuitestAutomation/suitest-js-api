const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	gettersComposer,
	cloneComposer,
	assertComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');

const setScreenOrientationFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'deviceSettings',
			deviceSettings: {
				type: 'setOrientation',
				params: {
					orientation: data.orientation,
				},
			},
		},
	});

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
			gettersComposer,
			cloneComposer,
			toJSONComposer,
		];

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		return output;
	};

	// Chain builder functions
	const setScreenOrientationChain = orientation => makeChain(classInstance, getComposers, {
		type: 'setScreenOrientation',
		orientation: validate(
			validators.SET_SCREEN_ORIENTATION,
			orientation,
			invalidInputMessage('setScreenOrientation', 'Screen orientation'),
		),
	});

	return {
		setScreenOrientation: setScreenOrientationChain,
		setScreenOrientationAssert: orientation => setScreenOrientationChain(orientation).toAssert(),
	};
};

module.exports = setScreenOrientationFactory;
