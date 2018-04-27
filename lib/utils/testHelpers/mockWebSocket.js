/* istanbul ignore file */
/**
 * Mocked WebSockets client module.
 */
const MockWebSocket = require('mock-socket').WebSocket;
const uuid = require('uuid/v1');
const {config} = require('../../../config/index');
const SuitestError = require('../SuitestError');
const texts = require('../../texts');
const logger = require('../logger');
const mock = require('mock-require');

let ws = null,
	requestPromises = {},
	connectionPromise = null;

/**
 * Mocked connect to ws server
 */
function connect(connectionOps = {}) {
	disconnect();
	logger.debug('mocked ws connect: ' + connectionOps);

	ws = new MockWebSocket(config.wsUrl, connectionOps);

	ws.onmessage = msg => {
		logger.debug('mocked ws message: ' + msg);
		handleResponse(JSON.parse(msg.data));
	};

	ws.onopen = () => {
		logger.debug('mocked ws open');
		connectionPromise.resolve();
		connectionPromise = null;
	};

	ws.onclose = code => {
		logger.debug('mocked ws close: ' + code);
		disconnect();
	};

	ws.onerror = error => {
		logger.debug('mocked ws error: ' + JSON.stringify(error));
		connectionPromise && connectionPromise.reject(
			new SuitestError(texts.wsNotConnected() + (error ? ` ${error}.` : ''), SuitestError.WS_ERROR));
		disconnect();
	};

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
			req.reject(new SuitestError(res.error ? res.error : '', SuitestError.UNKNOWN_ERROR));
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

		logger.debug('mocked ws send: ' + msg);
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
		ws.close(1000, 'mocked ws good bye!');
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

mock('../../api/webSockets', {
	connect,
	disconnect,
	send,
	isConnected,
});
