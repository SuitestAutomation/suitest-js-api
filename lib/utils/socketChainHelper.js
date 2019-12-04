const {compose} = require('ramda');
const assert = require('assert');
const SuitestError = require('./SuitestError');
const {
	getErrorMessage,
	getInfoErrorMessage,
	normalizeErrorType,
	responseMessageCode,
} = require('./socketErrorMessages');
const {config} = require('../../config');
const logger = require('./logger');
const t = require('../texts');

const assertionErrorTypes = ['queryFailed', 'appRunning', 'appNotRunning', 'queryTimeout'];

/**
 * Process network api websocket chain response
 * @returns {any}
 * @param {Function} toString
 */
const processServerResponse = toString => function processServerResponseHandler(res, data) {
	// TODO(SUIT-14049): use json instead of chainData
	const isAssertionError = assertionErrorTypes.includes(normalizeErrorType(res));
	const responseForError = getResponseForError(res);
	const message = getErrorMessage({
		chainData: data,
		response: res,
		toString,
	});
	const throwErr = err => {
		err.stack = data.stack;
		throw err;
	};
	const infoMessage = prefix => getInfoErrorMessage(message, prefix, res, data.stack);
	const isSuccess = res.result === 'success' || res.result === 'warning';
	const isEval = res.contentType === 'eval';
	const isTestLine = res.contentType === 'testLine';
	const isQuery = res.contentType === 'query';

	// warnings
	if (res.result === 'warning') {
		logger.warn(infoMessage(''));
	}
	// fatal errors
	if (res.result === 'fatal' && !config.continueOnFatalError) {
		logger.error(infoMessage(''));
		throwErr(new SuitestError(message), SuitestError.UNKNOWN_ERROR, responseForError);
	}
	// query
	if (isQuery) {
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
			return normalizeQueryResponse(res, queryKeyFound);
		}
	}
	// eval success
	if (isSuccess && isEval) {
		return true;
	}
	// eval failed due assertion error
	if (!isSuccess && isEval && isAssertionError) {
		return false;
	}
	// eval fail
	if (!isSuccess && (isEval || (isTestLine && !isAssertionError))) {
		logger.error(infoMessage(''));
		throwErr(new SuitestError(message, SuitestError.EVALUATION_ERROR, responseForError));
	}
	// testLine success
	if (isSuccess && isTestLine) {
		return;
	}
	// testLine fail
	if (!isSuccess && isTestLine && isAssertionError) {
		logger.error(infoMessage(t['prefix.assertionFailed']()));
		throwErr(new assert.AssertionError({
			// actual and expected included in message
			message,
			stackStartFn: processServerResponseHandler,
		}));
	}

	logger.error(infoMessage(''));
	throwErr(new SuitestError(message, SuitestError.UNKNOWN_ERROR, responseForError));
};

/**
 * Get socket request type string based on chain data
 * @param {any} data
 * some lines like 'openApp' do not have query type and can't fetch any value from dataGrabber
 * @param {boolean} [hasQuery=true]
 * @returns {'testLine' | 'query' | 'eval'}
 */
const getRequestType = (data, hasQuery = true) => {
	if (data.isAssert) {
		return 'testLine';
	}

	if (hasQuery && !data.comparator && !data.isClick && !data.isMoveTo && !data.sendText && !data.setText) {
		return 'query';
	}

	return 'eval';
};

const DEFAULT_COUNT = 1;
const DEFAULT_DELAY = 1;

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
 */
const applyClicks = (socketMessage) => {
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
		applyClicks
	)(socketMessage);
};

/**
 * Get timeout for assert based on chain data
 * @param data
 * @returns {number}
 */
const getTimeoutValue = data =>
	Number.isFinite(data.timeout) && data.timeout >= 0 ? data.timeout : config.defaultTimeout;

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

/**
 * Normalize query chain response return value
 * @param {Object} res
 * @param {string} queryKeyFound
 * @returns {Object|string|undefined}
 */
function normalizeQueryResponse(res, queryKeyFound) {
	if (
		(queryKeyFound === 'elementExists' || queryKeyFound === 'cookieExists')
		&& res[queryKeyFound] === false
	) {
		return void 0;
	}

	return res[queryKeyFound];
}

/**
 * @description return an object with response data for passing into SuitestError
 * @param res
 * @returns {{errorType: (string|*)}}
 */
function getResponseForError(res) {
	const responseForError = {errorType: normalizeErrorType(res)};
	const code = responseMessageCode(res);

	if (code) {
		responseForError.message = {code};
	}

	return responseForError;
}

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
