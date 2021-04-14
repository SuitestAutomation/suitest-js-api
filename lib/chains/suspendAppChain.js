// Import utils

const makeChain = require('../utils/makeChain');
const {
	makeThenComposer,
	makeToStringComposer,
	abandonComposer,
	cloneComposer,
	gettersComposer,
	assertComposer,
	makeToJSONComposer,
} = require('../composers');

const suspendAppFactory = (classInstance) => {
	const toJSON = () => ({
		type: 'eval',
		request: {
			type: 'suspendApp',
		},
	});

	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer({toJSON});

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

	const suspendAppChain = () => makeChain(classInstance, getComposers, {type: 'suspendApp'});

	return {
		suspendApp: suspendAppChain,
		suspendAppAssert: () => suspendAppChain().toAssert(),

		// For Unit tests
		getComposers,
		toString,
		toJSON,
	};
};

module.exports = suspendAppFactory;
