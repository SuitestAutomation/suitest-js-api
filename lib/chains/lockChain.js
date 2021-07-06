// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	gettersComposer,
	assertComposer,
	cloneComposer,
	makeToJSONComposer,
} = require('../composers');
const {getRequestType} = require('../utils/socketChainHelper');

const lockFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'lock',
		},
	});

	// Build Composers
	const toStringComposer = makeToStringComposer(toString);
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
	const lockChain = () => makeChain(classInstance, getComposers, {
		type: 'lock',
	});

	return {
		lock: lockChain,
		lockAssert: () => lockChain().toAssert(),

		// For testing
		getComposers,
		toJSON,
	};
};

module.exports = lockFactory;
