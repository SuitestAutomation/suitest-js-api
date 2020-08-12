// Import helpers and composers
const {compose} = require('ramda');
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
const {SUBJ_COMPARATOR_HR, SUBJ_COMPARATOR_HR_N} = require('../mappings');
const {
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const {location, locationCheck} = require('../texts');
const {
	isDefNegated,
	getPureComparatorType,
	processJsonMessageForToString,
	applyTimeout,
	applyNegation,
} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;

const locationFactory = (classInstance) => {
	const {logger} = classInstance;
	const toString = (jsonMessage) => {
		if (jsonMessage.type === 'query') {
			return location();
		}

		const def = processJsonMessageForToString(jsonMessage);
		const humanReadableSubjComparator = isDefNegated(def) ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;
		const comparatorType = getPureComparatorType(def);

		return locationCheck(humanReadableSubjComparator[comparatorType], def.condition.val);
	};

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
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data),
	);

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
		beforeSendMsg,
	};
};

module.exports = locationFactory;
