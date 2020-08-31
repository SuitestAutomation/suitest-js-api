/* istanbul ignore file */
/**
 * Mocked WebSockets client module.
 */
const MockWebSocket = require('mock-socket').WebSocket;
const {v1: uuid} = require('uuid');
const {config} = require('../../../index');
const SuitestError = require('../SuitestError');
const texts = require('../../texts');
const {handleProgress} = require('../interactiveProgressHanlder');
const mock = require('mock-require');

let ws = null,
	requestPromises = {},
	connectionPromise = null;

/**
 * Mocked connect to ws server
 */
function connect(connectionOps = {}) {
	disconnect();

	ws = new MockWebSocket(config.wsUrl, connectionOps);

	ws.onmessage = msg => {
		handleResponse(JSON.parse(msg.data));
	};

	ws.onopen = () => {
		connectionPromise.resolve();
		connectionPromise = null;
	};

	ws.onclose = () => {
		disconnect();
	};

	ws.onerror = error => {
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
	if (res.type === 'progress') {
		handleProgress(res);
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
