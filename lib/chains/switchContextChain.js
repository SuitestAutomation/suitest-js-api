const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {getRequestType} = require('../utils/socketChainHelper');

const switchContextFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'switchContext',
			context: data.context,
		},
	});

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
			toJSONComposer,
		];

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		return output;
	};

	const switchContextChain = context => makeChain(classInstance, getComposers, {
		type: 'switchContext',
		context: validate(
			validators.SWITCH_CONTEXT,
			context,
			invalidInputMessage('switchContext', 'Context'),
		),
	});

	return {
		switchContext: switchContextChain,
		// For Unit Testing
		getComposers,
		toJSON,
	};
};

module.exports = switchContextFactory;
