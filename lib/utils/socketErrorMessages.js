/* eslint-disable max-len */
const {EOL} = require('os');
const {path, has} = require('ramda');

const t = require('../texts');
const chainUtils = require('./chainUtils');
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
 * Get snippet lines output recursively
 * @param {Object} data
 * @param {string} data.testId - id of root test
 * @param {Object} data.definitions - test definitions by id
 * @param {Array} data.results - results for current runSnippet line
 * @param {number} data.level - level for indentation, initially 1
 * @param {string} data.verbosity - string verbosity level
 * @param {function} translate - added as function argument for testing
 */
const getSnippetLogs = ({testId, definitions, results, level, verbosity}, translate = chainUtils.translateLineResult) => {
	const indent = ' '.repeat(level);
	// Indent all text by indent constant
	const applyIndent = (str) => str.split('\n').map(l => indent + l).join('\n');
	// array of definition without comments to get right def based on lineId in results
	const resultLines = definitions[testId].filter(l => l.type !== 'comment');
	// Array of lines results with number of line in def without comments
	const linesNumbersWithResults = results.map(res => ({lineNumber: res.lineId.split('-').map(Number)[level] - 1, result: res}));
	// array of lines that have result
	const linesWithResults = linesNumbersWithResults.map(({lineNumber, result}) => ({def: resultLines[lineNumber], result}));
	// creating a list of lines and their results (if it hase it)
	const definitionsWithResults = definitions[testId].map(def => {
		if (def.type === 'openApp') {
			return;
		}
		// looking for lines in lines with results array
		const resultLine = linesWithResults.find(l => l.def === def);

		if (def.type === 'comment') {
			return def.val ? {def} : undefined;
		} else if (resultLine) {
			return resultLine;
		}

		// lines that does not have result
		return {def};
	}).filter(Boolean);

	return definitionsWithResults.reduce((logs, {def, result}) => {
		logs.push(applyIndent(translate(def, verbosity, result)));

		if (result && (result.results || result.loopResults)) {
			const getLoopLogs = loopRes => getSnippetLogs({
				testId: def.val,
				definitions,
				results: loopRes,
				level: level + 1,
				verbosity,
			}, translate);

			if (result.loopResults) {
				result.loopResults.forEach((loop, idx) => {
					logs.push(indent + `- loop count: ${idx + 1}`);
					logs.push(getLoopLogs(loop.results));
				});
			} else {
				logs.push(getLoopLogs(result.results));
			}
		}

		return logs;
	}, []).filter(Boolean).join('\n');
};

const commandErrors = {
	'notSupportedPlatform': () => t['commandError.notSupportedPlatform'](),
	'notSupportedIL': () => t['commandError.notSupportedIL'](),
	'timeout': () => t['commandError.timeout'](),
	'generalError': () => t['commandError.generalError'](),
};

/**
 * @description check that response error is related to "command" (not "line") execution.
 * For now it is related only for taking screenshots
 * @param response
 */
function isCommandError(response) {
	return response.result === 'error' && has(response.errorType, commandErrors);
}

/**
 * @description Create human readable error message from suitest error response
 * @param verbosity
 * @param {*} response websocket message
 * @param {Object} jsonMessage
 * @param {Array} snippets
 * @returns {string}
 */
function getErrorMessage({response, jsonMessage, verbosity, snippets}) {
	if (response.results && snippets) {
		return getSnippetLogs(
			{verbosity, definitions: snippets, results: response.results, testId: jsonMessage.request.val, level: 1},
		);
	}

	if (isCommandError(response)) {
		return commandErrors[response.errorType]();
	}

	return chainUtils.translateLineResult(jsonMessage, verbosity, response);
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
	getSnippetLogs,
};
