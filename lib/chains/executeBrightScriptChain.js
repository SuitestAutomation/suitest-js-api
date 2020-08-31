// Import helpers and composers
const {compose} = require('ramda');
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
const {
	executeBrightScript,
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {processServerResponse, getRequestType} = require('../utils/socketChainHelper');
const {processJsonMessageForToString} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;

const executeBrightScriptFactory = (classInstance) => {
	const {logger} = classInstance;
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'execBRSCmd',
			val: data.command,
		},
	});

	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data),
	);
	const toString = (jsonDef) => executeBrightScript(processJsonMessageForToString(jsonDef).val);

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
	const executeBrightScriptChain = brightScriptCode => makeChain(classInstance, getComposers, {
		type: 'executeBrightScript',
		command: validate(
			validators.NON_EMPTY_STRING,
			brightScriptCode,
			invalidInputMessage('executeBrightScript', 'BrightScript command')
		),
	});

	return {
		executeBrightScript: executeBrightScriptChain,
		executeBrightScriptAssert: brightScriptCode => executeBrightScriptChain(brightScriptCode).toAssert(),

		// For testing
		toJSON,
		beforeSendMsg,
	};
};

module.exports = executeBrightScriptFactory;
