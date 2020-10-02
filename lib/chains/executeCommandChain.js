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
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');

const executeCommandFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'execCmd',
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
	const executeCommandChain = jsOrString => makeChain(classInstance, getComposers, {
		type: 'executeCommand',
		command: validate(
			validators.NON_EMPTY_STRING,
			parseJS(jsOrString),
			invalidInputMessage('executeCommand', 'JavaScript command')
		),
	});

	return {
		executeCommand: executeCommandChain,
		executeCommandAssert: jsOrString => executeCommandChain(jsOrString).toAssert(),

		// For testing
		toJSON,
	};
};

module.exports = executeCommandFactory;
