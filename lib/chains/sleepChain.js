// Import helpers and composers
const {compose} = require('ramda');
const makeChain = require('../utils/makeChain');
const {processJsonMessageForToString} = require('../utils/chainUtils');
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	gettersComposer,
	assertComposer,
	cloneComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	sleep,
	invalidInputMessage,
} = require('../texts');
const {processServerResponse, getRequestType} = require('../utils/socketChainHelper');
const validation = require('../validation');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

const toString = (jsonMessage) => sleep(processJsonMessageForToString(jsonMessage).timeout);
const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	compose(toString, processJsonMessageForToString, toJSON)(data),
);

const toJSON = (data) => ({
	type: getRequestType(data, false),
	request: {
		type: 'sleep',
		timeout: data.milliseconds,
	},
});

// Build Composers
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

// Chain builder functions
const sleepChain = milliseconds => makeChain(getComposers, {
	type: 'sleep',
	milliseconds: validation.validate(
		validation.validators.POSITIVE_NUMBER,
		milliseconds,
		invalidInputMessage('sleep', 'Sleep milliseconds')
	),
});

module.exports = {
	sleep: sleepChain,
	sleepAssert: milliseconds => sleepChain(milliseconds).toAssert(),

	// For testing
	getComposers,
	toJSON,
	toString,
	beforeSendMsg,
};
