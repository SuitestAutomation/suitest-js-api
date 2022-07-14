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
const {invalidInputMessage} = require('../texts');
const {getRequestType} = require('../utils/socketChainHelper');
const {validate, validators} = require('../validation');

const openUrlFactory = (classInstance) => {
	const toJSON = data => ({
		type: getRequestType(data, false),
		request: {
			type: 'openUrl',
			url: data.absoluteURL,
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
	const openUrlChain = absoluteURL => makeChain(classInstance, getComposers, {
		type: 'openUrl',
		absoluteURL: validate(validators.NON_EMPTY_STRING, absoluteURL, invalidInputMessage('openUrl', 'Absolute URL')),
	});

	return {
		openUrl: openUrlChain,
		openUrlAssert: absoluteURL => openUrlChain(absoluteURL).toAssert(),

		// For Unit tests
		getComposers,
		toJSON,
	};
};

module.exports = openUrlFactory;
