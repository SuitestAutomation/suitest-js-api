const logger = require('./logger');
const texts = require('../texts');
const SuitestError = require('./SuitestError');

/**
 * Read IPC message
 * @param {Buffer} chunk
 * @returns {{id: string, data: Object}} - parsed message object
 */
const readMessage = chunk => JSON.parse(chunk.toString());

/**
 * Write IPC message
 * @param {string} id - message identifier
 * @param {Object} [data] - additional data
 * @returns {string} - stringified json message
 */
const writeMessage = (id, data = {}) => JSON.stringify({id, data});

/**
 * Handle IPC server error
 * @param {net.Server} server - ipc server
 * @param {Error} error - error
 * @throws {SuitestError}
 */
const handleIpcError = server => err => {
	if (err.errno === 'EADDRINUSE') {
		throw new SuitestError(
			texts.replFailedToCreateIpc(server.address().port),
			SuitestError.IPC_ERROR
		);
	}

	logger.debug('Error on IPC server', err);
};

/**
 * Helper to promisify ipc server start
 * @param {net.Server} server - ipc server
 * @returns {Promise<number>} - ipc port number
 */
const startIpc = server => {
	return new Promise((resolve, reject) => {
		server.listen(0, 'localhost', err => {
			err ? reject(err) : resolve(server.address().port);
		});
	});
};

module.exports = {
	startIpc,
	handleIpcError,
	readMessage,
	writeMessage,
};
