// Import utils
const {compose} = require('ramda');
const makeChain = require('../utils/makeChain');
const {processJsonMessageForToString} = require('../utils/chainUtils');

// Import chain composers
const {
	notComposer,
	existComposer,
	matchComposer,
	matchRepoComposer,
	matchJSComposer,
	// matchBrightScriptComposer,
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
	visibleComposer,
} = require('../composers');
const {
	element,
} = require('../texts');
const {
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const {
	SUBJ_COMPARATOR: SUBJ_COMPARATOR_M,
} = require('../mappings');
const logger = require('../utils/logger');
const {
	elementWithComparatorToJSON,
	elementWithComparatorToString,
	elementWithConditionToString,
} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;

// TODO(SUIT-14046) remove after socketChainHelper.js, socketErrorMessages.js refactoring
/**
 * Returns human readable description of the video chain.
 * @param data - chain data
 * @param nameOnly - if true only element name will be returned (like: {"apiId" : "boo"})
 * @returns {*}
 */
const toString = (data, nameOnly = false) => {
	const elName = 'video';

	if (nameOnly)
		return elName;

	let out = element(elName);

	if (data.comparator) {
		out = elementWithComparatorToString(data, elName);
	}

	return out;
};
const toString2 = (jsonMessage, nameOnly = false) => {
	const elName = 'video';

	if (nameOnly) {
		return elName;
	}

	if (jsonMessage.type === 'query') {
		return element(elName);
	}

	return elementWithConditionToString(processJsonMessageForToString(jsonMessage), elName);
};
const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	compose(toString2, processJsonMessageForToString, toJSON)(data),
);

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};
	const subject = {
		type: 'video',
	};

	// query
	if (type === 'query') {
		socketMessage.subject = {
			type: 'elementProps',
			selector: {video: true},
		};
	}

	// video subject
	if (data.comparator) {
		socketMessage.request = elementWithComparatorToJSON(data, subject);
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
const getComposers = (data) => {
	const output = [
		toStringComposer,
		thenComposer,
		cloneComposer,
		gettersComposer,
		toJSONComposer,
	];

	const comparatorType = data.comparator && data.comparator.type;
	const isMatchesComparator = comparatorType === SUBJ_COMPARATOR_M.MATCH
		|| comparatorType === SUBJ_COMPARATOR_M.MATCH_JS
		|| comparatorType === SUBJ_COMPARATOR_M.MATCH_BRS;

	const isVisibleComparator = comparatorType === SUBJ_COMPARATOR_M.VISIBLE;

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isNegated && !isMatchesComparator && !isVisibleComparator) {
		output.push(notComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.timeout) {
		output.push(timeoutComposer);
	}

	if (!data.comparator) {
		output.push(existComposer);
		if (!data.isNegated) {
			output.push(
				visibleComposer, matchComposer, matchRepoComposer, matchJSComposer,
				// matchBrightScriptComposer
			);
		}
	}

	if (!data.comparator && !data.isNegated) {
		output.push(
			isPlayingComposer,
			isStoppedComposer,
			isPausedComposer
		);
	}

	return output;
};

const videoChain = () => makeChain(getComposers, {});

module.exports = {
	video: videoChain,
	videoAssert: () => videoChain().toAssert(),

	// For testing
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
};
