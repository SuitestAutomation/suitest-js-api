const {path} = require('ramda');
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
const {
	networkRequestIntro,
	networkRequestURL,
	networkRequestAction,
	networkRequestHeaders,
} = require('../texts');
const {
	applyNegation,
	applyTimeout,
	getTimeoutValue,
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');
const SuitestError = require('../utils/SuitestError');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {NETWORK_PROP} = require('../mappings');
const logger = require('../utils/logger');
const {isDefNegated} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;

// TODO(SUIT-14046) remove after socketChainHelper.js, socketErrorMessages.js refactoring
const toString = data => {
	const {comparator, request, response, willBeMade, isNegated} = data;
	const isMatchingString = comparator && comparator.type === SUBJ_COMPARATOR.CONTAIN;
	const timeout = getTimeoutValue(data);

	const getProps = (props = []) => {
		return props.map(r => {
			r.name = typeof r.name === 'symbol' ? NETWORK_PROP[r.name] : r.name;

			return r;
		});
	};

	const text = [
		networkRequestIntro(),
		networkRequestURL(isMatchingString, comparator? comparator.val : 'equals'),
	];

	if (request)
		text.push(networkRequestHeaders(getProps(request.props), true));

	if (response) {
		text.push(networkRequestHeaders(getProps(response.props)));
	}

	text.push(networkRequestAction(isNegated, willBeMade, timeout));

	return text.join('\n');
};

const toString2 = (jsonDef) => {
	const isMatchingString = jsonDef.condition.subject.compare === SUBJ_COMPARATOR.CONTAIN;
	const willBeMade = jsonDef.condition.searchStrategy === 'notMatched';
	const request = jsonDef.condition.subject.requestInfo;
	const response = jsonDef.condition.subject.responseInfo;

	const text = [
		networkRequestIntro(),
		networkRequestURL(isMatchingString, jsonDef.condition.subject.val),
	];

	if (request.length) {
		text.push(networkRequestHeaders(request, true));
	}

	if (response.length) {
		text.push(networkRequestHeaders(response));
	}

	text.push(networkRequestAction(isDefNegated(jsonDef), willBeMade, jsonDef.timeout));

	return text.join('\n');
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
		name: typeof item.name === 'symbol' ? NETWORK_PROP[item.name] : item.name,
		val: item.val,
		compare: item.compare,
	}));

	// Apply response parameters
	subject.responseInfo = (data.response && data.response.props || []).map(item => ({
		name: typeof item.name === 'symbol' ? NETWORK_PROP[item.name] : item.name,
		val: item.val,
		compare: item.compare,
	}));

	return socketMessage;
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

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
	toString,
	toJSON,
	getComposers,
	beforeSendMsg,
};
