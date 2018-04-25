const {compose, path} = require('ramda');
const {EOL} = require('os');
const assert = require('assert');
const SuitestError = require('../utils/SuitestError');
const {ELEMENT_PROP} = require('../mappings');

/**
 * Process network api websocket chain response
 * @returns {any}
 * @param {Function} toString
 */
const processServerResponse = toString => function processServerResponseHandler(res, data) {
	const queryFailed = res.errorType && res.errorType.startsWith('queryFailed');

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
	if (res.result !== 'success' && res.contentType === 'eval' && queryFailed) {
		return false;
	}
	// testLine success
	if (res.result === 'success' && res.contentType === 'testLine') {
		return;
	}
	// testLine fail
	if (res.result !== 'success' && res.contentType === 'testLine' && queryFailed) {
		const {actualValue, expectedValue} = getActualExpectedValues(res, data);

		assert.fail(
			actualValue,
			expectedValue,
			getAssertErrorMessage(res, toString(data)),
			null,
			processServerResponseHandler
		);
	}

	if (res.errorType === 'appRunning') {
		let msg = 'App is still running';

		if (data.type === 'press') {
			msg += `\nMaximum amount of key presses ${data.repeat} reached. Condition was not satisfied`;
		}
		throw new SuitestError(msg);
	}

	throw new SuitestError(res.errorType || res.error);
};

/**
 * @description return actualValue and expectedValue depended on server response
 * if response contain top level actualValue and expectedValue - they will be returned.
 * if response has expression array of element properties - all properties expected/actual values will be concatenated, for example:
 * { actualValue: 'height: 720\nwidth: 1282', expectedValue: 'height: 100\nwidth: 200' }
 * @param {object} res
 * @param {object} data
 * @returns {{actualValue: *, expectedValue: *}}
 */
function getActualExpectedValues(res, data) {
	// check top level values, and return them, if they are presented
	if (['actualValue', 'expectedValue'].some(prop => res.hasOwnProperty(prop))) {
		return {
			actualValue: res.actualValue,
			expectedValue: res.expectedValue,
		};
	}

	// check expression array
	if (Array.isArray(res.expression)) {
		const expectedValues = [];
		const actualValues = [];
		const props = path(['comparator', 'props'], data);
		const valTemplate = (name, val) => `${name}: ${val}`;

		// go thought expression array
		for (let i = 0; i < res.expression.length; i++) {
			const expr = res.expression[i];
			const prop = props[i];
			const propName = ELEMENT_PROP[prop.name];

			expectedValues.push(valTemplate(propName, expr.expectedValue));
			actualValues.push(valTemplate(propName, expr.actualValue));
		}

		return {
			actualValue: actualValues.join(EOL),
			expectedValue: expectedValues.join(EOL),
		};
	}

	return {};
}

/**
 * Create human readable error message from suitest error response
 * @param {Object} res
 * @param {string} text chain specific message (result of calling toString(data))
 * @returns {String}
 */
function getAssertErrorMessage(res, text) {
	const errors = res.errors ? `${EOL}errors: ${JSON.stringify(res.errors)}` : '';

	return `${res.errorType}: "${text}"${errors}`;
}

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
