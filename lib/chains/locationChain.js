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
const {SUBJ_COMPARATOR_HR, SUBJ_COMPARATOR} = require('../mappings');
const {
	processServerResponse,
	getRequestType,
	applyTimeout,
	applyNegation,
} = require('../utils/socketChainHelper');
const {location, locationCheck, chainIsAboutToBeExecuted} = require('../texts');
const {logVerboseMessage} = require('../utils/logger');

const toString = data => {
	if (!data.comparator) {
		return location();
	}

	return locationCheck(SUBJ_COMPARATOR_HR[data.comparator.type], data.comparator.val);
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
		}, data);

		if (data.comparator) {
			socketMessage.request.condition.type = applyNegation(SUBJ_COMPARATOR[data.comparator.type], data);
			socketMessage.request.condition.val = data.comparator.val;
		}
	}

	return socketMessage;
};
const beforeSendMsg = (data) => logVerboseMessage(chainIsAboutToBeExecuted('location()', toString(data)));

// Build Composers
const toStringComposer = makeToStringComposer(toString);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString), beforeSendMsg);
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
const locationChain = () => makeChain(getComposers, {type: 'location'});

module.exports = {
	location: locationChain,
	locationAssert: () => locationChain().toAssert(),

	// For testing
	toJSON,
	beforeSendMsg,
};
