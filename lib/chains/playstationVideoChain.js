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
	applyTimeout,
} = require('../utils/socketChainHelper');
const {VALUE: VALUE_M} = require('../mappings');
const logger = require('../utils/logger');
const {
	getPureComparatorType,
	elementWithConditionToString,
	processJsonMessageForToString,
} = require('../utils/chainUtils');
const {getMatchExpression} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;
const {placeholdEmpty} = require('../utils/stringUtils');
const {SUBJ_COMPARATOR} = require('../constants/comparator');

// TODO(SUIT-14046) remove after socketChainHelper.js, socketErrorMessages.js refactoring
/**
 * Returns human readable description of the native video chain.
 * @param data - chain data
 * @param nameOnly - if true only element name will be returned
 * @returns {string}
 */
const toString = (data, nameOnly = false) => {
	const elName = psVideoChainName();

	if (nameOnly)
		return elName;

	let out = element(elName);

	if (data.comparator) {
		if (data.comparator.type === SUBJ_COMPARATOR.HAD_NO_ERROR) {
			out = elName + ` ${psVideoHadNoError()} ` +
				(data.searchStrategy === 'currentUrl' ? psVideoHadNoErrorCurrentUrl() : psVideoHadNoErrorAll());
		} else {
			const matches = data.comparator.props.map(
				one => `  ${one.name} ${one.type} ${placeholdEmpty(VALUE_M[one.val] || one.val)}`
			);

			out = elementMatchProps(elName, '\n' + matches.join(',\n'));
		}
	}

	return out;
};

const toString2 = (jsonMessage, nameOnly = false) => {
	const elName = psVideoChainName();

	if (nameOnly) {
		return elName;
	}

	if (jsonMessage.type === 'query') {
		return element(elName);
	}

	const comparatorType = getPureComparatorType(jsonMessage);
	const {condition} = jsonMessage;

	if (comparatorType === SUBJ_COMPARATOR.HAD_NO_ERROR) {
		return `${elName} ${psVideoHadNoError()} `
			+ (condition.searchStrategy === 'currentUrl' ? psVideoHadNoErrorCurrentUrl() : psVideoHadNoErrorAll());
	}

	return elementWithConditionToString(jsonMessage, elName);
};

const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	compose(toString2, processJsonMessageForToString, toJSON)(data),
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
