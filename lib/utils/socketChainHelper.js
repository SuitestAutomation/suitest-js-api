const fs = require('fs');
const {isNil} = require('ramda');
const assert = require('assert');
const SuitestError = require('./SuitestError');
const {
	getErrorMessage,
	getInfoErrorMessage,
	normalizeErrorType,
	responseMessageCode,
} = require('./socketErrorMessages');
const t = require('../texts');
const {mapLogLevelsToTranslationModule} = require("./chainUtils");
const {getSnippetLogs} = require("./socketErrorMessages");

const assertionErrorTypes = ['queryFailed', 'appRunning', 'appNotRunning', 'queryTimeout'];

/**
 * Process network api websocket chain response
 * @param logger
 * @param {verbosity} verbosity level
 * @returns {any}
 */
const processServerResponse = (logger, verbosity) =>
	function processServerResponseHandler(res, data, jsonMessage, snippets) {
		const isSnippet = data.type === 'runSnippet';
		const isAssertionError = isSnippet || assertionErrorTypes.includes(normalizeErrorType(res));
		const responseForError = getResponseForError(res);
		const message = getErrorMessage({
			response: res,
			verbosity,
			jsonMessage,
			snippets,
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
		const isTakeScreenshot = res.contentType === 'takeScreenshot';
		const isAborted = res.result === 'aborted';

		// warnings
		if (res.result === 'warning') {
			logger.warn(infoMessage(''));
		}
		// fatal errors
		if (res.result === 'fatal') {
			logger.error(infoMessage(''));
			throwErr(new SuitestError(message, SuitestError.UNKNOWN_ERROR, responseForError));
		}
		if (isAborted) {
			logger.error(t.executionAborted());
			throwErr(new SuitestError(t.executionAborted()));
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
			logger.error(infoMessage());
			throwErr(new SuitestError(message, SuitestError.EVALUATION_ERROR, responseForError));
		}
		// testLine success
		if (isSuccess) {
			if (isSnippet) {
				const snippet = getSnippetLogs({
					verbosity: mapLogLevelsToTranslationModule[verbosity],
					definitions: snippets,
					results: [],
					testId: jsonMessage.request.val,
					level: 1,
				});

				logger.log(snippet);

				return;
			}
			if (isTestLine) {
				return;
			}
		}
		// testLine fail
		if (!isSuccess && isTestLine && isAssertionError) {
			logger.error(infoMessage());
			throwErr(new assert.AssertionError({
			// actual and expected included in message
				message,
				stackStartFn: processServerResponseHandler,
			}));
		}

		// takeScreenshot success
		if (isTakeScreenshot && isSuccess) {
			if (data.dataFormat === 'raw') {
				return res.buffer;
			} else if (data.dataFormat === 'base64') {
				return res.buffer.toString('base64');
			} else if (data.fileName) {
				try {
					return fs.promises.writeFile(data.fileName, res.buffer);
				} catch (e) {
					logger.error(e.message);
					throwErr(e);
				}
			}

			return;
		} else if (isTakeScreenshot && !isSuccess) {
			logger.error(infoMessage());
			throwErr(new SuitestError(message, SuitestError.EVALUATION_ERROR, responseForError));
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

	if (
		hasQuery &&
		!data.comparator &&
		!data.isClick &&
		!data.isMoveTo &&
		isNil(data.sendText) &&
		isNil(data.setText)
	) {
		return 'query';
	}

	return 'eval';
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
};
