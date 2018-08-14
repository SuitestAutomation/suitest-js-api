const {identity, path} = require('ramda');
const makeChain = require('../utils/makeChain');
const {
	notComposer,
	timeoutComposer,
	abandonComposer,
	makeThenComposer,
	makeToStringComposer,
	gettersComposer,
	cloneComposer,
	assertComposer,

	equalComposer,
	containComposer,

	wasMadeComposer,
	willBeMadeComposer,
	requestMatchesComposer,
	responseMatchesComposer,
	makeToJSONComposer,
} = require('../composers');
const texts = require('../texts');
const {
	applyNegation,
	applyTimeout,
	getTimeoutValue,
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const SuitestError = require('../utils/SuitestError');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const logger = require('../utils/logger');

const getTemplate = (hasParams, isNegated, includesPrevious, isContain) => {
	const textName = [
		'networkRequest',
		isNegated ? 'Not' : '',
		hasParams && 'MatchingParams',
		includesPrevious ? 'WasMade' : 'WillBeMade',
		isContain ? 'Contain' : 'To',
	].filter(identity).join('');

	return texts[textName];
};

const toString = data => {
	const {comparator, request, response, wasMade, isNegated} = data;
	const template = getTemplate(
		request || response,
		isNegated,
		wasMade,
		comparator && comparator.type === SUBJ_COMPARATOR.CONTAIN
	);

	return template(comparator && comparator.val, getTimeoutValue(data));
};

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};
	const subject = {
		type: 'network',
	};

	if (!data.comparator) {
		throw new SuitestError('Missing URL to look for', SuitestError.INVALID_INPUT);
	}

	if (!data.wasMade && !data.willBeMade) {
		throw new SuitestError(
			'Either .wasMade() or .wilBeMade() chain method must be applied to network chain',
			SuitestError.INVALID_INPUT
		);
	}

	// Add condition and apply timeout
	socketMessage.request = applyTimeout({
		type: 'assert',
		condition: {
			subject,
			type: 'made',
		},
	}, data);

	const condition = path(['request', 'condition'], socketMessage) || {};

	// Apply search strategy
	condition.searchStrategy = data.wasMade ? 'all' : 'notMatched';

	// Apply URL comparator
	condition.type = applyNegation(condition.type, data);
	subject.compare = data.comparator.type;
	subject.val = data.comparator.val;

	// Apply request parameters
	subject.requestInfo = (data.request && data.request.props || []).map(item => ({
		name: item.name,
		val: item.val,
		compare: item.compare,
	}));

	// Apply response parameters
	subject.responseInfo = (data.response && data.response.props || []).map(item => ({
		name: item.name,
		val: item.val,
		compare: item.compare,
	}));

	return socketMessage;
};
const beforeSendMsg = (data) => logger.info(texts.chainIsAboutToBeExecuted('networkRequest()', toString(data)));

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
		gettersComposer,
		cloneComposer,
		toJSONComposer,
	];

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.isNegated) {
		output.push(notComposer);
	}

	if (!('timeout' in data)) {
		output.push(timeoutComposer);
	}

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.wasMade && !data.willBeMade) {
		output.push(wasMadeComposer, willBeMadeComposer);
	}

	if (!data.request) {
		output.push(requestMatchesComposer);
	}

	if (!data.response) {
		output.push(responseMatchesComposer);
	}

	if (!data.comparator) {
		output.push(containComposer, equalComposer);
	}

	return output;
};

// Chain builder functions
const networkRequestChain = () => makeChain(getComposers, {type: 'networkRequest'});

module.exports = {
	networkRequest: networkRequestChain,
	networkRequestAssert: () => networkRequestChain().toAssert(),

	// For testing
	toJSON,
	getComposers,
	beforeSendMsg,
};
