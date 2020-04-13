// Import helpers and composers
const {compose} = require('ramda');
const makeChain = require('../utils/makeChain');
const {processJsonMessageForToString} = require('../utils/chainUtils');
const {
	abandonComposer,
	makeToStringComposer,
	makeThenComposer,
	assertComposer,
	cloneComposer,
	gettersComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	openURL,
	invalidInputMessage,
} = require('../texts');
const {processServerResponse, getRequestType} = require('../utils/socketChainHelper');
const {validate, validators} = require('../validation');
const getOpType = require('../utils/opType').getOpType;

const openUrlFactory = (classInstance) => {
	const {logger} = classInstance;
	const toString = (jsonMessage) => openURL(processJsonMessageForToString(jsonMessage).url);

	const toJSON = data => ({
		type: getRequestType(data, false),
		request: {
			type: 'openUrl',
			url: data.absoluteURL,
		},
	});
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data),
	);

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

		return output;
	};

	// Chain builder functions
	const openUrlChain = absoluteURL => makeChain(classInstance, getComposers, {
		type: 'openUrl',
		absoluteURL: validate(validators.NON_EMPTY_STRING, absoluteURL, invalidInputMessage('openUrl', 'Absolute URL')),
	});

	return {
		openUrl: openUrlChain,
		openUrlAssert: absoluteURL => openUrlChain(absoluteURL).toAssert(),

		// For Unit tests
		getComposers,
		toString,
		toJSON,
		beforeSendMsg,
	};
};

module.exports = openUrlFactory;
