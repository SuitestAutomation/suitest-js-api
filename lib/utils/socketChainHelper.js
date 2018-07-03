const {compose} = require('ramda');
const assert = require('assert');
const SuitestError = require('./SuitestError');
const {getErrorMessage} = require('./socketErrorMessages');
const {config} = require('../../config');
const {prependStack} = require('./stackTraceParser');
const logger = require('./logger');
const t = require('../texts');
const {stripAnsiChars} = require('./stringUtils');

const assertionErrorTypes = ['queryFailed', 'appRunning', 'appNotRunning', 'queryTimeout'];

/**
 * Process network api websocket chain response
 * @returns {any}
 * @param {Function} toString
 */
const processServerResponse = toString => function processServerResponseHandler(res, data) {
	const isAssertionError = assertionErrorTypes.includes(res.errorType);
	const message = getErrorMessage({
		chainData: data,
		response: res,
		toString,
	});

	// fatal errors
	if (res.result === 'fatal' && !config.continueOnFatalError) {
		logger.info(stripAnsiChars(message));
		throw prependStack(new SuitestError(message), data.stack);
	}
	// query
	if (res.contentType === 'query') {
		// if one of query fields is on res, return it
		const queryKeyFound = [
			'cookieValue',
			'cookieExists',
			'elementProps',
			'elementExists',
			'execute',
			'location',
		].find(key => key in res);

		if (queryKeyFound) {
			return res[queryKeyFound];
		}
	}
	// eval success
	if (res.result === 'success' && res.contentType === 'eval') {
		return true;
	}
	// eval fail
	if (res.result !== 'success' && res.contentType === 'eval' && isAssertionError) {
		return false;
	}
	// testLine success
	if (res.result === 'success' && res.contentType === 'testLine') {
		return;
	}
	// testLine fail
	if (res.result !== 'success' && res.contentType === 'testLine' && isAssertionError) {
		logger.info(t['prefix.assertionFailed']() + stripAnsiChars(message));
		throw prependStack(new assert.AssertionError({
			// actual and expected included in message
			message,
			stackStartFn: processServerResponseHandler,
		}), data.stack);
	}

	logger.info(t['prefix.error']() + stripAnsiChars(message));
	throw prependStack(new SuitestError(message), data.stack);
};

/**
 * Get socket request type string based on chain data
 * @param {any} data
 * some lines like 'openApp' do not have query type and can't fetch any value from dataGrabber
 * @param {boolean} [hasQuery=true]
 * @returns {String}
 */
const getRequestType = (data, hasQuery = true) => {
	if (data.isAssert) {
		return 'testLine';
	}

	if (hasQuery && !data.comparator && !data.isClick && !data.isMoveTo && !data.sendText) {
		return 'query';
	}

	return 'eval';
};

const DEFAULT_COUNT = 1;
const DEFAULT_DELAY = 1000;
const DEFAULT_TIMEOUT = 2000;

/**
 * Apply count and delay to socketMessage
 * @param {Object} socketMessage
 * @param {Object} data
 * @return {Object} socketMessage
 */
const applyCountAndDelay = (socketMessage, data) => {
	socketMessage.count = 'repeat' in data ? data.repeat : DEFAULT_COUNT;
	socketMessage.delay = 'interval' in data ? data.interval : DEFAULT_DELAY;

	return socketMessage;
};

/**
 * @description Apply default clicks array
 * @param {Object} socketMessage
 * @param {Object} data
 */
const applyClicks = (socketMessage, data) => {
	socketMessage.clicks = [{
		type: 'single',
		button: 'left',
	}];

	return socketMessage;
};

/**
 * @description pipeline function which compose applyClicks and applyCountAndDelay
 * @param {Object} socketMessage
 * @param {Object} data
 */
const applyCountAndDelayAndClicks = (socketMessage, data) => {
	return compose(
		msg => applyCountAndDelay(msg, data),
		msg => applyClicks(msg, data)
	)(socketMessage);
};

/**
 * Get timeout for assert based on chain data
 * @param data
 * @returns {number}
 */
const getTimeoutValue = data => Number.isFinite(data.timeout) && data.timeout >= 0 ? data.timeout : DEFAULT_TIMEOUT;

/**
 * Apply timeout to condition socketMessage
 * @param {Object} socketMessage
 * @param {Object} data
 * @return {Object} socketMessage
 */
const applyTimeout = (socketMessage, data) => {
	const timeout = getTimeoutValue(data);

	if (timeout > 0) {
		socketMessage.timeout = timeout;
		socketMessage.type = 'wait';
	}

	return socketMessage;
};

/**
 * Apply negation to comparator string
 * @param {String} comparator
 * @param {Object} data
 * @return {String} condition
 */
const applyNegation = (comparator, data) => {
	return data.isNegated ? ('!' + comparator) : comparator;
};

/**
 * Apply condition to socket message based on until composer chain
 * @param {Object} socketMessage
 * @param {Object} data
 * @return {Object} socketMessage
 */
const applyUntilCondition = (socketMessage, data) => {
	if (data.until) {
		return {
			...socketMessage,
			condition: data.until,
		};
	}

	return socketMessage;
};

module.exports = {
	processServerResponse,
	getRequestType,
	applyCountAndDelay,
	getTimeoutValue,
	applyTimeout,
	applyNegation,
	applyClicks,
	applyCountAndDelayAndClicks,
	applyUntilCondition,
};
