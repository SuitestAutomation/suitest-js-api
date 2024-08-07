// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	notComposer,
	abandonComposer,
	makeToStringComposer,
	makeThenComposer,
	startWithComposer,
	endWithComposer,
	containComposer,
	equalComposer,
	matchJSComposer,
	timeoutComposer,
	cloneComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	getRequestType,
	processServerResponse,
} = require('../utils/socketChainHelper');
const {
	applyTimeout,
	applyNegation,
} = require('../utils/chainUtils');

const locationFactory = (classInstance) => {
	const {logger} = classInstance;

	const toJSON = data => {
		const type = getRequestType(data);
		const subject = {type: 'location'};
		const socketMessage = {type};

		if (type === 'query') {
			socketMessage.subject = subject;
		} else {
			socketMessage.request = applyTimeout({
				type: 'assert',
				condition: {subject},
			}, data, classInstance.config.defaultTimeout);

			if (data.comparator) {
				socketMessage.request.condition.type = applyNegation(data.comparator.type, data);
				socketMessage.request.condition.val = data.comparator.val;
			}
		}

		return socketMessage;
	};

	// Build Composers
	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON, processServerResponse(
		logger,
		{
			logLevel: classInstance.getConfig().logLevel,
			testLines: classInstance.getConfig().testLines,
			testErrors: classInstance.getConfig().testErrors,
		}));
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

		if (!data.isNegated) {
			output.push(notComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.timeout) {
			output.push(timeoutComposer);
		}

		if (!data.comparator) {
			output.push(startWithComposer, endWithComposer, containComposer, equalComposer, matchJSComposer);
		}

		return output;
	};

	// Chain builder functions
	const locationChain = () => makeChain(classInstance, getComposers, {type: 'location'});

	return {
		location: locationChain,
		locationAssert: () => locationChain().toAssert(),

		// For testing
		toJSON,
	};
};

module.exports = locationFactory;
