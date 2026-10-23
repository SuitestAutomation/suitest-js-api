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
const executeNetworkCommandFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'throttleNetwork',
			downloadBytesPerSec: data.downloadBytesPerSec,
			uploadBytesPerSec: data.uploadBytesPerSec,
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
	const executeNetworkCommandChain = (throttling) => {
		const {downloadBytesPerSec, uploadBytesPerSec} = validate(
			validators.NETWORK_THROTTLING,
			throttling,
			invalidInputMessage('executeNetworkCommand', 'Network throttling'),
		);

		return makeChain(
			classInstance,
			getComposers,
			{
				type: 'throttleNetwork',
				downloadBytesPerSec,
				uploadBytesPerSec,
			},
		);
	};

	return {
		executeNetworkCommand: executeNetworkCommandChain,
		executeNetworkCommandAssert: (throttling) => executeNetworkCommandChain(throttling).toAssert(),

		// For Unit tests
		getComposers,
		toJSON,
	};
};

module.exports = executeNetworkCommandFactory;
