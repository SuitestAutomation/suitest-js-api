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
const {
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');

const executeBrightScriptFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'execBRSCmd',
			val: data.command,
		},
	});

	// Build Composers
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
			invalidInputMessage('executeBrightScript', 'BrightScript command'),
		),
	});

	return {
		executeBrightScript: executeBrightScriptChain,
		executeBrightScriptAssert: brightScriptCode => executeBrightScriptChain(brightScriptCode).toAssert(),

		// For testing
		toJSON,
	};
};

module.exports = executeBrightScriptFactory;
