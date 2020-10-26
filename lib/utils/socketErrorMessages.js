/* eslint-disable max-len */
const {EOL} = require('os');
const {path} = require('ramda');

const t = require('../texts');
const {translateLineResult} = require('./chainUtils');
const {stripAnsiChars} = require('./stringUtils');
const {getFirstStackLine} = require('./stackTraceParser');

/** Description of the function
 * @name ToStringFunc
 * @function
 * @param {Object} jsonMessage can be generated socket message or raw lined definition json
 * @param {boolean=} [nameOnly]
 * @returns {string}
 */

/** Error map handler
 * @name ErrorMapHandler
 * @function
 * @param {Object} data
 * @param {ToStringFunc} data.toString - chain toString function which accept socketMessage or json lined definition and return human readable representation
 * @param {Object} data.response - websocket message
 * @param {Object} data.jsonMessage - socket message or raw test command json definition
 * @returns {string}
 */

const responseMessageCode = response => path(['message', 'code'], response);
const responseMessageInfo = response => path(['message', 'info'], response);
const jsExpressionErrorType = 'jsExpressionError';
const testSnippetError = 'testSnippetError';

/**
 * @description Create human readable error message from suitest error response
 * @param verbosity
 * @param {*} response websocket message
 * @param {Object} jsonMessage
 * @returns {string}
 */
function getErrorMessage({response, jsonMessage, verbosity}) {
	return translateLineResult(jsonMessage, verbosity, response);
}

/**
 * @description check if error should be considered as fatal
 * @param {Object} res websocket message
 * @returns {boolean}
 */
function isErrorFatal(res) {
	return res.result === 'fatal' || normalizeErrorType(res) === 'testIsNotStarted';
}

/**
 * @description Normalize errorType
 * @param {*} response webscoket message
 * @returns {string}
 */
function normalizeErrorType(response) {
	if (response.executeThrowException || response.matchJSThrowException) {
		return jsExpressionErrorType;
	}
	if (response.results) {
		return testSnippetError;
	}

	return response.errorType || response.executionError;
}

module.exports = {
	getErrorMessage,
	/**
	 * @description Create human readable error message for real time info logs
	 * @param {string} message
	 * @param {string} prefix
	 * @param {Object} res
	 * @param {string} [stack]
	 * @returns {string}
	 */
	getInfoErrorMessage: (message, prefix = '', res, stack) => {
		const suffix = isErrorFatal(res) ? ` ${t['suffix.sessionWillClose']()}` : '';
		const msg = prefix + stripAnsiChars(message) + suffix;
		const firstStackLine = stack && getFirstStackLine(stack);
		const nl = firstStackLine && msg.endsWith(EOL) ? '' : EOL;

		return msg + nl + firstStackLine;
	},
	responseMessageCode,
	responseMessageInfo,
	normalizeErrorType,
};
