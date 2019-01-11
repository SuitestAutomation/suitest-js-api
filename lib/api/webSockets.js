/* istanbul ignore file */

/**
 * WebSockets client module.
 */
const WS = require('ws');
const uuid = require('uuid/v1');
const {path} = require('ramda');

const {config} = require('../../config');
const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');
const logger = require('../utils/logger');
const {handleProgress} = require('../utils/interactiveProgressHanlder');
const {getInfoErrorMessage} = require('../utils/socketErrorMessages');
const {opTypes} = require('../utils/opType');
const logLevels = require('../../lib/constants/logLevels');

let ws = null,
	requestPromises = {},
	connectionPromise = null;

/**
 * Connect to ws server
 */
function connect(connectionOps = {}) {
	disconnect();
	logger.debug('Initializing websocket connection with options:', connectionOps);

	ws = new WS(config.wsUrl, connectionOps);

	ws.on('message', msg => {
		let obj;

		try {
			obj = JSON.parse(msg);
		} catch (e) {
			// ignore
		}

		const content = path(['content'], obj) || {};

		// request logs come in with huge amounts of data that
		// pollutes the log - get rid of that.
		// TODO it would be great to display this data in other then debug mode.
		if (content.type === 'requestLog') {
			const logItem = obj.content.logItem;

			const url = logItem.request? logItem.request.uri : '';
			const requestId = logItem.requestId;
			const type = url? 'Request start' : 'Request end';
			const responseBody = logItem.response && logItem.response.responseBody;

			if (config.logLevel === logLevels.debug) {

				return logger.debug(
					'Incoming request log (details omitted)\n' +
					`ItemId: ${requestId}\n` +
					`Type: ${type}\n` +
					(url ? `URL: ${url}` : '') +
					(responseBody ? `ResponseBody: [body]` : '') +
					'\n',
				);
			} else if (config.logLevel === logLevels.silly) {

				return logger.silly(
					'Incoming request log (details omitted)\n' +
					`ItemId: ${requestId}\n` +
					`Type: ${type}\n` +
					(url ? `URL: ${url}` : '') +
					(responseBody ? `ResponseBody: ${responseBody}` : '') +
					'\n',
				);
			}
		}

		const isConsole = content.type === 'console' && content.data;

		// display suitestify mapping message
		if (isConsole && content.data[0] === 'SUITESTIFY: domainMapping') {
			return logger.log(content.data.join('\n'));
		}

		// display application logs
		if (isConsole) {
			const logType = '|' + ({
				log: opTypes.appLog,
				info: opTypes.appInfo,
				warn: opTypes.appWarn,
				error: opTypes.appError,
			}[content.subtype] || opTypes.appInfo) + '|';

			// ADDING logType after new line characters needed for proper displaying multilines
			// TODO: need to remove replacing after release test-repl-with-updated-logs branch
			return logger.log(
				logType,
				content.data.join('\n').replace(/\n/g, `\n${logType} `)
			);
		}

		logger.debug('Received message:', msg);
		handleResponse(JSON.parse(msg));
	});

	ws.on('open', () => {
		logger.debug('Websocket connected.');
		connectionPromise.resolve();
		connectionPromise = null;
	});

	ws.on('close', code => {
		logger.debug('Closing websocket connection: ' + code);
		disconnect();
	});

	ws.on('error', error => {
		logger.debug('Got websocket error:', error);
		connectionPromise && connectionPromise.reject(
			new SuitestError(texts.wsNotConnected() + (error ? ` ${error}.` : ''), SuitestError.WS_ERROR));
		disconnect();
	});

	return new Promise((resolve, reject) => {
		connectionPromise = {
			resolve,
			reject,
		};
	});
}

/**
 * Handle ws response, resolve promise from requestPromises map by response messageId
 * @param {*} msg
 */
function handleResponse(msg) {
	const messageId = msg.messageId;
	const res = msg.content.response || msg.content;
	const req = requestPromises[messageId];

	/* istanbul ignore else */
	if (req) {
		if (['query', 'testLine', 'eval'].includes(req.contentType)) {
			req.resolve({
				...res,
				contentType: req.contentType,
			}); // resolve chain requests
		} else if (res.result === 'success') {
			req.resolve(res);
		} else {
			const message = res.error ? res.error : texts.unknownError();

			logger.error(getInfoErrorMessage(message, '', res, ''));
			req.reject(new SuitestError(message, SuitestError.UNKNOWN_ERROR));
		}

		delete requestPromises[messageId];
	}
	if (res.type === 'progress') {
		handleProgress(res.status, res.code);
	}
}

/**
 * Handle ws request, add promise to requestPromises map by request messageId
 * @param {string} messageId
 * @param contentType
 * @returns {Promise}
 */
function handleRequest(messageId, contentType) {
	return new Promise((resolve, reject) => {
		requestPromises[messageId] = {
			resolve,
			reject,
			contentType,
		};
	});
}

/**
 * Send ws message
 * @param {Object} content
 * @returns {Promise}
 */
function send(content) {
	if (ws) {
		const messageId = uuid();

		const msg = JSON.stringify({
			messageId,
			content,
		});

		logger.debug('Sending message:', msg);
		ws.send(msg);

		return handleRequest(messageId, content.type);
	}

	return Promise.reject(new SuitestError(texts.wsNotConnected(), SuitestError.WS_ERROR));
}

/**
 * Disconnect from ws server
 */
function disconnect() {
	if (ws) {
		ws.close(1000, 'good bye!');
	}

	ws = null;
	requestPromises = {};
	connectionPromise = null;
}

/**
 * Check if ws client is connected to server
 */
function isConnected() {
	return !!ws;
}

module.exports = {
	connect,
	disconnect,
	send,
	isConnected,
};
