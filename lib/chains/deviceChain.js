// Import utils
const makeChain = require('../utils/makeChain');
const setOrientationComposer = require("../composers/setOrientationComposer");
const {getRequestType} = require('../utils/socketChainHelper');

// Import chain composers
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	gettersComposer,
	makeToJSONComposer,
} = require('../composers');

const deviceFactory = (classInstance) => {
	/**
	 * @description get browser command type basing on internal chain data
	 * @param data
	 * @returns {'refresh' | 'goBack' | 'goForward' | 'setWindowSize' | 'dismissAlertMessage' | 'acceptPromptMessage' | 'acceptAlertMessage'}
	 */

	const toJSON = (data) => {
		const lineType = 'deviceSettings';
		const socketMessage = {
			type: getRequestType(data, false),
			request: {type: lineType},
		};

		const orientationMap = {
			'portrait': 'portrait',
			'portrait-reversed': 'portraitReversed',
			'landscape': 'landscape',
			'landscape-reversed': 'landscapeReversed',
		};

		socketMessage.request = {
			...socketMessage.request,
			deviceSettings: {type: 'setOrientation', params: {'orientation': orientationMap[data.orientation]}},
		};

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

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.orientation) {
			output.push(setOrientationComposer);
		}

		return output;
	};

	const deviceChain = () => {
		return makeChain(classInstance, getComposers, {type: 'deviceSettings'});
	};

	return {
		device: deviceChain,
		// For testing
		toJSON,
	};
};

module.exports = deviceFactory;
