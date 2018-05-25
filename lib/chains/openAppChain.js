// Import helpers and composers
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
const {
	openApp,
	openAppAtURL,
	invalidInputMessage,
	chainIsAboutToBeExecuted,
} = require('../texts');
const {validate, validators} = require('../validataion');
const {processServerResponse, getRequestType} = require('../utils/socketChainHelper');
const {logVerboseMessage} = require('../utils/logger');

// Build Composers
const toString = ({relativeURL}) => {
	if (relativeURL)
		return openAppAtURL(relativeURL);

	return openApp();
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
const beforeSendMsg = (data) => logVerboseMessage(chainIsAboutToBeExecuted(`openApp(${data.relativeURL || ''})`, toString(data)));

const toStringComposer = makeToStringComposer(toString);
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
