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
const {
	invalidInputMessage,
} = require('../texts');
const {getRequestType} = require('../utils/socketChainHelper');
const validation = require('../validation');

const sleepFactory = (classInstance) => {
	const toJSON = (data) => ({
		type: getRequestType(data, false),
		request: {
			type: 'sleep',
			timeout: data.milliseconds,
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
	const sleepChain = milliseconds => makeChain(classInstance, getComposers, {
		type: 'sleep',
		milliseconds: validation.validate(
			validation.validators.ST_VAR_OR_POSITIVE_NUMBER,
			milliseconds,
			invalidInputMessage('sleep', 'Sleep milliseconds')
		),
	});

	return {
		sleep: sleepChain,
		sleepAssert: milliseconds => sleepChain(milliseconds).toAssert(),

		// For testing
		getComposers,
		toJSON,
	};
};

module.exports = sleepFactory;
