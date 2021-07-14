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
const {getRequestType} = require('../utils/socketChainHelper');

const suspendAppChainFactory = (classInstance) => {
	const toJSON = data => ({
		type: getRequestType(data, false),
		request: {
			type: 'suspendApp',
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
	const suspendAppChain = () => makeChain(classInstance, getComposers, {
		type: 'suspendApp',
	});

	return {
		suspendApp: suspendAppChain,
		suspendAppAssert: () => suspendAppChain().toAssert(),
		// For Unit tests
		getComposers,
		toJSON,
	};
};

module.exports = suspendAppChainFactory;
