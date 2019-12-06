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
const {SUBJ_COMPARATOR_HR, SUBJ_COMPARATOR_HR_N} = require('../mappings');
const {
	processServerResponse,
	getRequestType,
	applyTimeout,
	applyNegation,
} = require('../utils/socketChainHelper');
const {location, locationCheck} = require('../texts');
const logger = require('../utils/logger');
const {isDefNegated, getPureComparatorType} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;

// TODO(SUIT-14046) remove after socketChainHelper.js, socketErrorMessages.js refactoring
const toString = data => {
	if (!data.comparator) {
		return location();
	}

	const humanReadableSubjComparator = data.isNegated ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;

	return locationCheck(humanReadableSubjComparator[data.comparator.type], data.comparator.val);
};

const toString2 = (jsonMessage) => {
	if (jsonMessage.type === 'query') {
		return location();
	}

	const def = jsonMessage;
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
		}, data);

		if (data.comparator) {
			socketMessage.request.condition.type = applyNegation(data.comparator.type, data);
			socketMessage.request.condition.val = data.comparator.val;
		}
	}

	return socketMessage;
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

// Build Composers
const toStringComposer = makeToStringComposer(toString2, toJSON);
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
