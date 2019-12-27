// Import utils
const {compose} = require('ramda');
const makeChain = require('../utils/makeChain');

// Import chain composers
const {
	matchComposer,
	timeoutComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
	isPlayingComposer,
	isStoppedComposer,
	isPausedComposer,
	hadNoErrorComposer,
} = require('../composers');
const {
	element,
	elementMatchProps,
	psVideoChainName,
	psVideoHadNoError,
	psVideoHadNoErrorAll,
	psVideoHadNoErrorCurrentUrl,
} = require('../texts');
const {
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const logger = require('../utils/logger');
const {
	getPureComparatorType,
	elementWithConditionToString,
	processJsonMessageForToString,
} = require('../utils/chainUtils');
const {getMatchExpression, applyTimeout} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;
const {SUBJ_COMPARATOR} = require('../constants/comparator');

/**
 * Returns human readable description of the native video chain.
 * @param jsonMessage - json socket message of command line json representation
 * @param nameOnly - if true only element name will be returned
 * @returns {string}
 */
const toString = (jsonMessage, nameOnly = false) => {
	const elName = psVideoChainName();

	if (nameOnly) {
		return elName;
	}

	if (jsonMessage.type === 'query') {
		return element(elName);
	}

	const jsonDef = processJsonMessageForToString(jsonMessage);
	const comparatorType = getPureComparatorType(jsonDef);
	const {condition} = jsonDef;

	if (comparatorType === SUBJ_COMPARATOR.HAD_NO_ERROR) {
		return `${elName} ${psVideoHadNoError()} `
			+ (condition.searchStrategy === 'currentUrl' ? psVideoHadNoErrorCurrentUrl() : psVideoHadNoErrorAll());
	}

	return elementWithConditionToString(jsonDef, elName);
};

const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	compose(toString, toJSON)(data),
);

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};
	const subject = {
		type: 'psVideo',
	};

	// query
	if (type === 'query') {
		socketMessage.subject = {
			type: 'elementProps',
			selector: {psVideo: true},
		};
	}

	// element subject
	if (data.comparator) {
		socketMessage.request = applyTimeout({
			type: 'assert',
			condition: {subject},
		}, data);

		socketMessage.request.condition.type = data.comparator.type;

		if (data.comparator.type === SUBJ_COMPARATOR.HAD_NO_ERROR) {
			socketMessage.request.condition.searchStrategy = data.searchStrategy;
		} else {
			// match props
			socketMessage.request.condition.expression = getMatchExpression(data);
		}
	}

	return socketMessage;
};

// Build Composers
const toStringComposer = makeToStringComposer(toString, toJSON);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString), beforeSendMsg);
const toJSONComposer = makeToJSONComposer(toJSON);

/**
 * Function accepts data object of future chain as input
 * and returns a list of composers that should build the chain
 * @param data
 * @returns {*[]}
 */
const getComposers = (data) => {
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

	if (!data.timeout) {
		output.push(timeoutComposer);
	}

	if (!data.comparator) {
		output.push(
			hadNoErrorComposer,
			matchComposer,
			isPlayingComposer,
			isStoppedComposer,
			isPausedComposer
		);
	}

	return output;
};

const playstationVideoChain = () => makeChain(getComposers, {});

module.exports = {
	playstationVideo: playstationVideoChain,
	playstationVideoAssert: () => playstationVideoChain().toAssert(),

	// For testing
	beforeSendMsg,
};
