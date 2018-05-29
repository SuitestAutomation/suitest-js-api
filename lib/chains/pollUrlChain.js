// Import utils
const makeChain = require('../utils/makeChain');
const {validate, validators} = require('../validataion');
const {
	makeThenComposer,
	makeToStringComposer,
	abandonComposer,
	gettersComposer,
	assertComposer,
	cloneComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	getRequestType,
	processServerResponse,
} = require('../utils/socketChainHelper');
const {pollUrl, chainIsAboutToBeExecuted, invalidInputMessage} = require('../texts');
const logger = require('../utils/logger');

const toString = ({url, response}) => pollUrl(url, response);
const beforeSendMsg = (data) => logger.info(chainIsAboutToBeExecuted(`pollUrl(${data.url})`, toString(data)));

const toJSON = (data) => {
	const type = getRequestType(data, false);
	const {url = '', response = ''} = data;

	return {
		type,
		request: {
			type: 'pollUrl',
			url,
			response,
		},
	};
};

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

const pollUrlChain = (url, response) => makeChain(getComposers, {
	type: 'pollUrl',
	url: validate(validators.NON_EMPTY_STRING, url, invalidInputMessage('pollUrl', 'URL')),
	response: validate(validators.NON_EMPTY_STRING, response, invalidInputMessage('pollUrl', 'response')),
});

module.exports = {
	pollUrl: pollUrlChain,
	pollUrlAssert: (url, response) => pollUrlChain(url, response).toAssert(),

	// For testing
	getComposers,
	toJSON,
	toString,
	beforeSendMsg,
};
