/**
 * WebSockets client module.
 */
const WS = require('ws');
const uuid = require('uuid/v1');

const {config} = require('../../config');
const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');
const logger = require('../utils/logger');

let ws = null,
	requestPromises = [],
	connectionPromise = null;

/**
 * Connect to ws server
 */
function connect(connectionOps = {}) {
	disconnect();
	logger.debug('ws connect: ' + connectionOps);

	ws = new WS(config.wsUrl, connectionOps);

	ws.on('message', msg => {
		logger.debug('ws message: ' + msg);
		handleResponse(JSON.parse(msg));
	});

	ws.on('open', () => {
		logger.debug('ws open');
		connectionPromise.resolve();
		connectionPromise = null;
	});

	ws.on('close', code => {
		logger.debug('ws close: ' + code);
		connectionPromise && connectionPromise.reject(code);
		disconnect();
	});

	ws.on('error', error => {
		logger.debug('ws error: ' + error);
		connectionPromise && connectionPromise.reject(error);
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

	if (req) {
		if (['query', 'testLine', 'eval'].includes(req.contentType)) {
			req.resolve({
				...res,
				contentType: req.contentType,
			}); // resolve chain requests
		} else if (res.result === 'success') {
			req.resolve(res);
		} else {
			req.reject(new SuitestError(texts.wsNotConnected() + (res.error ? ` ${res.error}.` : ''), SuitestError.WS_ERROR));
		}

		delete requestPromises[messageId];
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

		logger.debug('ws send: ' + msg);
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
	requestPromises = [];
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
