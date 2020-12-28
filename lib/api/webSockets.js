/* istanbul ignore file */

/**
 * WebSockets client module.
 */
const WS = require('ws');
const {v1: uuid} = require('uuid');
const {path} = require('ramda');
const Raven = require('raven');
const fetch = require('node-fetch');

const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');
const {handleProgress} = require('../utils/interactiveProgressHandler');
const {getInfoErrorMessage} = require('../utils/socketErrorMessages');
const {translateNotStartedReason} = require('../utils/translateResults');
const logLevels = require('../../lib/constants/logLevels');

const webSocketsFactory = (self) => {
	const {config, logger} = self;

	let ws = null,
		requestPromises = {},
		connectionPromise = null,
		rawDataMessageId = null;

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

			if (content.type === 'requestLog' && self.listenerCount('networkLog')) {
				const networkLog = JSON.parse(JSON.stringify(content.logItem));

				networkLog.type = 'networkLog';
				delete networkLog.lineId;
				delete networkLog.finalPart;

				self.emit('networkLog', networkLog);
			} else if (
				content.type === 'console' &&
				content.data[0] !== 'SUITESTIFY: domainMapping'
			) {
				const {args: data, method: level} = logger.getAppOutput(content.subtype, content.data);

				self.emit('consoleLog', {data, level, type: 'consoleLog'});
			}

			if (content.type === 'executorStopped') {
				// Notify user about executor being stopped
				throw new SuitestError(texts.executorStopped());
			}// request logs come in with huge amounts of data that
			// pollutes the log - get rid of that.
			// TODO it would be great to display this data in other then debug mode.
			if (content.type === 'requestLog') {
				const logItem = obj.content.logItem;

				const url = logItem.request? logItem.request.uri : '';
				const requestId = logItem.requestId;
				const type = url? 'Request start' : 'Request end';
				const requestBody = logItem.request && logItem.request.requestBody;
				const responseBody = logItem.response && logItem.response.responseBody;

				if ([logLevels.normal, logLevels.verbose, logLevels.debug].includes(config.logLevelNetworkLogs)) {
					return logger.network(
						'Incoming request log (details omitted)\n' +
						`ItemId: ${requestId}\n` +
						`Type: ${type}\n` +
						(url ? `URL: ${url}` : '') +
						(requestBody ? 'RequestBody: [body]' : '') +
						(responseBody ? 'ResponseBody: [body]' : '') +
						'\n',
					);
				} else if (config.logLevelNetworkLogs === logLevels.silly) {
					return logger.network(
						'Incoming request log\n' +
						`ItemId: ${requestId}\n` +
						`Type: ${type}\n` +
						(url ? `URL: ${url}` : '') +
						(requestBody ? `RequestBody: ${requestBody}` : '') +
						(responseBody ? `ResponseBody: ${responseBody}` : '') +
						'\n',
					);
				}
			}

			const isConsole = content.type === 'console';
			const consoleData = isConsole && content.data;

			// display suitestify mapping message
			if (consoleData && consoleData[0] === 'SUITESTIFY: domainMapping') {
				return logger.log(content.data.join('\n'));
			}

			// display application logs
			if (isConsole) {
				return logger.appOutput(content.subtype, content.data, content.timestamp);
			}

			const bufferReceived = Buffer.isBuffer(msg);
			const message = bufferReceived ? msg : JSON.parse(msg);

			if (!bufferReceived) {
				logger.debug('Received message:', msg);
			} else {
				logger.debug('Received message: [raw data]');
			}

			const screenshotData = (buffer, messageId, result = 'success') => ({
				messageId,
				content: {
					buffer,
					result,
				},
			});

			// receiving Buffer for previous ws message related to takeScreenshot
			if (bufferReceived) {
				const data = screenshotData(message, rawDataMessageId);

				rawDataMessageId = null;
				handleResponse(data);
			} else if (
				path([message.messageId, 'contentType'])(requestPromises) === 'takeScreenshot' &&
				message.content.result === 'success'
			) {
				// if isRaw true - next ws message will contains screenshot as binary data
				if (message.content.isRaw) {
					rawDataMessageId = message.messageId;
				} else if (typeof message.content.url === 'string') {
					// if isRaw false and url provided - fetch data from url
					fetch(message.content.url)
						.then(res => res.buffer())
						.then((buffer) => {
							handleResponse(screenshotData(buffer, message.messageId));
						}).catch(() => {
							handleResponse({
								messageId: message.messageId,
								content: {
									result: 'error',
								},
							});
						});
				}
			} else {
				handleResponse(message);
			}
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
			if (['query', 'testLine', 'eval', 'takeScreenshot'].includes(req.contentType)) {
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
		if (res.type === 'notRunningReason') {
			try {
				logger.log(translateNotStartedReason(res.reason));
			} catch (error) {
				Raven.captureException(error);
			}
		}
		if (res.type === 'progress') {
			handleProgress(logger, res);
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

	return {
		connect,
		disconnect,
		send,
		isConnected,
	};
};

module.exports = webSocketsFactory;
