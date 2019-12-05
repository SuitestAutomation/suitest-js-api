const {compose, path} = require('ramda');
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
	intervalComposer,
	repeatComposer,
	untilComposer,
	sendTextComposer,
} = require('../composers');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {application, applicationCommandMalformed, applicationSendText, chainRepeat, chainRepeat2} = require('../texts');
const {
	getRequestType, applyTimeout, processServerResponse, applyCountAndDelay, applyUntilCondition,
} = require('../utils/socketChainHelper');
const SuitestError = require('../utils/SuitestError');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

// TODO(SUIT-14046) remove after socketChainHelper.js, socketErrorMessages.js refactoring
const toString = (data) => {
	if (data && data.sendText) {
		return data.repeat
			? applicationSendText(data.sendText) + chainRepeat(data.repeat, data.interval)
			: applicationSendText(data.sendText);
	}

	return application();
};
const toString2 = (jsonMessage) => {
	const jsonDef = jsonMessage.request;
	const subjectType = path(['condition', 'subject', 'type'], jsonDef);

	if (subjectType === 'application') {
		return application();
	}
	if (jsonDef.type === 'sendText') {
		return 'condition' in jsonDef
			? applicationSendText(jsonDef.val)
			: applicationSendText(jsonDef.val) + chainRepeat2(jsonDef.count, jsonDef.delay);
	}

	return '';
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

const toJSON = data => {
	if (!data.sendText && (!data.comparator || data.comparator.type !== SUBJ_COMPARATOR.HAS_EXITED)) {
		// Application can only be of "hasExited()" eval / assert
		throw new SuitestError(applicationCommandMalformed(), SuitestError.INVALID_INPUT);
	}

	if (data.sendText) {
		return {
			type: getRequestType(data, false),
			request: compose(
				msg => applyUntilCondition(msg, data),
				msg => applyCountAndDelay(msg, data),
			)({
				type: 'sendText',
				target: {type: 'window'},
				val: data.sendText,
			}),
		};
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

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.timeout) {
		output.push(timeoutComposer);
	}

	if (!data.comparator) {
		output.push(hasExitedComposer);
	}

	if (data.sendText) {
		if (!data.interval) {
			output.push(intervalComposer);
		}

		if (!data.repeat) {
			output.push(repeatComposer);
		}

		if (!data.until) {
			output.push(untilComposer);
		}
	} else {
		output.push(sendTextComposer);
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
