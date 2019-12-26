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
	openApp,
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {processServerResponse, getRequestType} = require('../utils/socketChainHelper');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

const toString = (jsonMessage) => {
	const {relativeUrl} = processJsonMessageForToString(jsonMessage);

	return openApp(relativeUrl);
};

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

	return socketMessage;
};

const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	compose(toString, processJsonMessageForToString, toJSON)(data),
);

const toStringComposer = makeToStringComposer(toString, toJSON);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString), beforeSendMsg);
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
const openAppChain = relativeURL => makeChain(getComposers, {
	type: 'openApp',
	relativeURL: validate(
		validators.NON_EMPTY_STRING_OR_UNDEFINED,
		relativeURL,
		invalidInputMessage('openApp', 'Relative URL')),
});

module.exports = {
	openApp: openAppChain,
	openAppAssert: relativeUrl => openAppChain(relativeUrl).toAssert(),

	// For Unit tests
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
};
