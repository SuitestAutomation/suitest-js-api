const makeChain = require('../utils/makeChain');
const {
	abandonComposer,
	makeToStringComposer,
	makeThenComposer,
	assertComposer,
	cloneComposer,
	gettersComposer,
	makeToJSONComposer,
} = require('../composers');
const {invalidInputMessage} = require('../texts');
const {getRequestType} = require('../utils/socketChainHelper');
const {validate, validators} = require('../validation');

/**
 * @param {SUITEST_API} classInstance
 */
const openDeepLinkFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'openDeepLink',
			deepLink: data.deepLink,
		},
	});

	// Build composers
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

		return output;
	};

	// Chain builder functions
	const openDeepLinkChain = (deepLink) => makeChain(
		classInstance,
		getComposers,
		{
			type: 'openDeepLink',
			deepLink: validate(
				validators.NON_EMPTY_STRING,
				deepLink,
				invalidInputMessage('openDeepLink', 'Deep Link'),
			),
		},
	);

	return {
		openDeepLink: openDeepLinkChain,
		openDeepLinkAssert: (deepLink) => openDeepLinkChain(deepLink).toAssert(),

		// For Unit tests
		getComposers,
		toJSON,
	};
};

module.exports = openDeepLinkFactory;
