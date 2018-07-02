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
	chainIsAboutToBeExecuted,
} = require('../texts');
const {
	applyTimeout,
	applyNegation,
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const {SUBJ_COMPARATOR_HR, SUBJ_COMPARATOR_HR_N, SUBJ_COMPARATOR: SUBJ_COMPARATOR_M} = require('../mappings');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {validate, validators} = require('../validataion');
const logger = require('../utils/logger');

const toString = data => {
	if (!data.comparator) {
		return cookieGet(data.cookieName);
	}

	const humanReadableSubjComparator = data.isNegated ? SUBJ_COMPARATOR_HR_N : SUBJ_COMPARATOR_HR;

	switch (data.comparator.type) {
		case SUBJ_COMPARATOR.EXIST:
			return (data.isNegated ? cookieNotExist : cookieExist)(data.cookieName);
		case SUBJ_COMPARATOR.MATCH_JS:
			return (data.isNegated ? cookieNotMatchJS : cookieMatchJS)(data.cookieName);
		default:
			return cookieStringCondition(
				data.cookieName,
				humanReadableSubjComparator[data.comparator.type],
				data.comparator.val
			);
	}
};
const beforeSendMsg = (data) => logger.info(chainIsAboutToBeExecuted(`cookie(${data.cookieName})`, toString(data)));

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
			socketMessage.request.condition.type = applyNegation(SUBJ_COMPARATOR_M[data.comparator.type], data);
			socketMessage.request.condition.val = data.comparator.val;
		}
	}

	return socketMessage;
};

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
		output.push(
			startWithComposer, endWithComposer, containComposer, equalComposer,
			matchJSComposer,
			existComposer
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
	toJSON,
	beforeSendMsg,
};
