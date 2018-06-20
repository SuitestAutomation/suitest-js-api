// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	hasExitedComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	assertComposer,
	timeoutComposer,
	gettersComposer,
	makeToJSONComposer,
} = require('../composers');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {application, invalidInput, chainIsAboutToBeExecuted} = require('../texts');
const {getRequestType, applyTimeout, processServerResponse} = require('../utils/socketChainHelper');
const SuitestError = require('../utils/SuitestError');
const logger = require('../utils/logger');

const toString = () => application();
const beforeSendMsg = (data) => logger.info(chainIsAboutToBeExecuted('application()', toString(data)));

const toJSON = data => {
	if (!data.comparator || data.comparator.type !== SUBJ_COMPARATOR.HAS_EXITED) {
		// Application can only be of "hasExited()" eval / assert
		throw new SuitestError(invalidInput(), SuitestError.INVALID_INPUT);
	}

	return {
		type: getRequestType(data, false),
		request: applyTimeout({
			type: 'assert',
			condition: {
				subject: {
					type: 'application',
				},
				type: 'exited',
			},
		}, data),
	};
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

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.timeout) {
		output.push(timeoutComposer);
	}

	if (!data.comparator) {
		output.push(hasExitedComposer);
	}

	return output;
};

// Chain builder functions
const applicationChain = () => makeChain(getComposers, {type: 'application'});

module.exports = {
	application: applicationChain,
	applicationAssert: () => applicationChain().toAssert(),

	// For Unit tests
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
};
