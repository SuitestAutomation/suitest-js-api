// Import helpers and composers
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
const parseJS = require('../utils/parseJS');
const {
	executeCommand,
	invalidInputMessage,
	chainIsAboutToBeExecuted,
} = require('../texts');
const {validate, validators} = require('../validataion');
const {processServerResponse, getRequestType} = require('../utils/socketChainHelper');
const logger = require('../utils/logger');

const toJSON = (data) => ({
	type: getRequestType(data, false),
	request: {
		type: 'execCmd',
		val: data.command,
	},
});

const beforeSendMsg = (data) => logger.info(chainIsAboutToBeExecuted('executeCommand(...)', toString(data)));
const toString = (data) => typeof data.command === 'string' && data.command.slice(0, 10) || '';

// Build Composers
const toStringComposer = makeToStringComposer(executeCommand);
const thenComposer = makeThenComposer(toJSON, processServerResponse(executeCommand), beforeSendMsg);
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
const executeCommandChain = jsOrString => makeChain(getComposers, {
	type: 'executeCommand',
	command: validate(
		validators.NON_EMPTY_STRING,
		parseJS(jsOrString),
		invalidInputMessage('executeCommand', 'JavaScript command')
	),
});

module.exports = {
	executeCommand: executeCommandChain,
	executeCommandAssert: jsOrString => executeCommandChain(jsOrString).toAssert(),

	// For testing
	toJSON,
	beforeSendMsg,
};
