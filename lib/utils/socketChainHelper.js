const fs = require('fs');
const path = require('path');
const {Buffer} = require('buffer');
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
const {mapLogLevelsToTranslationModule} = require('./chainUtils');
const {getSnippetLogs} = require('./socketErrorMessages');

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
		const isLastScreenshot = res.contentType === 'lastScreenshot';
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
				'elementCssProps',
				'elementExists',
				'elementHandles',
				'elementHandle',
				'attributes',
				'execute',
				'location',
				'ocr',
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
				const dir = path.dirname(data.fileName);

				return fs.promises
					.access(dir)
					.catch(() => fs.promises.mkdir(dir))
					.then(() => fs.promises.writeFile(data.fileName, res.buffer))
					.catch(e => {
						logger.error(e.message);
						throwErr(e);
					});
			}

			return;
		} else if (isTakeScreenshot && !isSuccess) {
			logger.error(infoMessage());
			throwErr(new SuitestError(message, SuitestError.EVALUATION_ERROR, responseForError));
		}

		// getting last screenshot for visual testing
		if (isLastScreenshot && isSuccess) {
			if (data.dataFormat === 'raw') {
				return res.buffer;
			} else if (data.dataFormat === 'base64') {
				return res.buffer.toString('base64');
			}
		} else if (isLastScreenshot && !isSuccess) {
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
		!data.tap &&
		!data.isScroll &&
		!data.isSwipe &&
		!data.isMoveTo &&
		isNil(data.sendText) &&
		isNil(data.setText) &&
		isNil(data.properties) &&
		isNil(data.comparators)
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

const PROTOCOL_NUMBER = 0x00;

/**
 * @description concat socket message and binary data pair into single binary data
 * protocol is:
 * | protocol number (1 byte) | size of json socket message (32-bit unsigned integer) | socket message | binary data |
 * example:
 * | 0x00 | 0x000001c(28) | Buffer.from(JSON.stringify({type: 'eval', request: {}})) | binaryData |
 * @param {Object|string} socketMessage
 * @param {Buffer} binaryData
 * @returns {Buffer}
 */
function createBufferFromSocketMessage([socketMessage, binaryData]) {
	const protocolNumber = PROTOCOL_NUMBER;
	const socketMessageSizeMaxBytes = 4;
	const socketMessageBuffer = Buffer.from(typeof socketMessage === 'string' ? socketMessage : JSON.stringify(socketMessage));
	const sizeSocketMessage = Buffer.alloc(socketMessageSizeMaxBytes);

	sizeSocketMessage.writeUInt32BE(socketMessageBuffer.length);

	const header = Buffer.concat([Buffer.from([protocolNumber]), sizeSocketMessage]);

	return Buffer.concat([header, socketMessageBuffer, binaryData]);
}

/**
 * @param {Buffer} binarySocketMessage
 * @returns {null | [string, Buffer]}
 */
function parseBinarySocketMessage(binarySocketMessage) {
	const protocolBufferOffset = 1;
	const jsonMessageDataSizeOffset = 4;
	const headerOffset = protocolBufferOffset + jsonMessageDataSizeOffset;
	const protocolNumber = binarySocketMessage[0];

	if (protocolNumber !== PROTOCOL_NUMBER) {
		return null;
	}

	const textSize = binarySocketMessage.readUInt32BE(protocolBufferOffset);
	const textPart = binarySocketMessage.toString(
		'utf-8',
		headerOffset,
		headerOffset + textSize,
	);
	const binaryPart = binarySocketMessage.subarray(headerOffset + textSize);

	return [
		textPart,
		binaryPart,
	];
}
module.exports = {
	processServerResponse,
	getRequestType,
	createBufferFromSocketMessage,
	parseBinarySocketMessage,
};
