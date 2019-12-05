// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {isDefNegated, getPureComparatorType} = require('../utils/chainUtils');
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
	existComposer,
	timeoutComposer,
	cloneComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	cookieGet,
	cookieExist,
	cookieMatchJS,
	cookieNotExist,
	cookieNotMatchJS,
	cookieStringCondition,
	invalidInputMessage,
} = require('../texts');
const {
	applyTimeout,
	applyNegation,
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const {SUBJ_COMPARATOR_HR, SUBJ_COMPARATOR_HR_N} = require('../mappings');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {validate, validators} = require('../validation');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

// TODO(SUIT-14046) remove after socketChainHelper.js, socketErrorMessages.js refactoring
const toString = data => {
	const {comparator, cookieName, isNegated} = data;

	if (!comparator) {
		return cookieGet(cookieName);
	}

	const humanReadableSubjComparator = isNegated ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;

	switch (comparator.type) {
		case SUBJ_COMPARATOR.EXIST:
			return (isNegated ? cookieNotExist : cookieExist)(cookieName);
		case SUBJ_COMPARATOR.MATCH_JS:
			return (isNegated ? cookieNotMatchJS : cookieMatchJS)(cookieName, comparator.val);
		default:
			return cookieStringCondition(
				cookieName,
				humanReadableSubjComparator[comparator.type],
				comparator.val
			);
	}
};

const toString2 = (jsonMessage) => {
	if (jsonMessage.type === 'query' && jsonMessage.subject.type === 'cookie') {
		return cookieGet(jsonMessage.subject.cookieName);
	}

	const jsonDef = jsonMessage;
	const isNegated = isDefNegated(jsonDef);
	const comparatorType = getPureComparatorType(jsonDef);
	const cookieName = jsonDef.condition.subject.val;
	const humanReadableSubjComparator = isNegated ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;

	switch (comparatorType) {
		case SUBJ_COMPARATOR.EXIST:
			return (isNegated ? cookieNotExist : cookieExist)(cookieName);
		case SUBJ_COMPARATOR.MATCH_JS:
			return (isNegated ? cookieNotMatchJS : cookieMatchJS)(cookieName, jsonDef.condition.val);
		default:
			return cookieStringCondition(
				cookieName,
				humanReadableSubjComparator[comparatorType],
				jsonDef.condition.val
			);
	}
};

const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

const toJSON = data => {
	const type = getRequestType(data);
	const subject = {type: 'cookie'};
	const socketMessage = {type};

	if (data.cookieName) {
		subject[type === 'query' ? 'cookieName' : 'val'] = data.cookieName;
	}

	if (type === 'query') {
		socketMessage.subject = subject;
	} else {
		socketMessage.request = Object.assign(
			socketMessage.request || {},
			applyTimeout({
				type: 'assert',
				condition: {subject},
			}, data)
		);

		if (data.comparator) {
			socketMessage.request.condition.type = applyNegation(data.comparator.type, data);
			socketMessage.request.condition.val = data.comparator.val;
		}
	}

	return socketMessage;
};

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
		output.push(
			startWithComposer, endWithComposer, containComposer, equalComposer, matchJSComposer, existComposer
		);
	}

	return output;
};

// Chain builder functions
const cookieChain = cookieName => {
	return makeChain(getComposers, {
		type: 'cookie',
		cookieName: validate(validators.NON_EMPTY_STRING, cookieName, invalidInputMessage('cookie', 'Cookie name')),
	});
};

module.exports = {
	cookie: cookieChain,
	cookieAssert: cookieName => cookieChain(cookieName).toAssert(),

	// For Unit tests
	getComposers,
	toString,
	toString2,
	toJSON,
	beforeSendMsg,
};
