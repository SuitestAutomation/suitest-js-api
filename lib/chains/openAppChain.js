// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	abandonComposer,
	launchModeComposer,
	makeToStringComposer,
	makeThenComposer,
	assertComposer,
	cloneComposer,
	gettersComposer,
	makeToJSONComposer,
	deepLinkComposer,
} = require('../composers');
const {
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');

const openAppChainFactory = (classInstance) => {
	const toJSON = data => {
		const socketMessage = {
			type: getRequestType(data, false),
			request: {
				type: 'openApp',
			},
		};

		if (data.relativeURL) {
			socketMessage.request.relativeUrl = data.relativeURL;
		}

		if (data.launchMode) {
			socketMessage.request.launchMode = data.launchMode;
		}

		if (data.deepLink) {
			socketMessage.request.deepLink = data.deepLink;
		}

		return socketMessage;
	};

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

		if (!data.launchMode) {
			output.push(launchModeComposer);
		}

		if (!data.deepLink) {
			output.push(deepLinkComposer);
		}

		return output;
	};

	// Chain builder functions
	const openAppChain = relativeURL => makeChain(classInstance, getComposers, {
		type: 'openApp',
		relativeURL: validate(
			validators.NON_EMPTY_STRING_OR_UNDEFINED,
			relativeURL,
			invalidInputMessage('openApp', 'Relative URL')),
	});

	return {
		openApp: openAppChain,
		openAppAssert: relativeUrl => openAppChain(relativeUrl).toAssert(),
		// For Unit tests
		getComposers,
		toJSON,
	};
};

module.exports = openAppChainFactory;
