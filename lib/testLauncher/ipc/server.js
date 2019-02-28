/**
 * IPC server - launcher process
 */

const net = require('net');
const texts = require('../../texts');
const logger = require('../../utils/logger');
const SuitestError = require('../../utils/SuitestError');
const messageId = require('../../constants/ipcMessageId');
const {write, getState, addListener, removeListener, handleMessage, broadcast} = require('./ipcHelper');

let idCount = 0;

const state = {
	connections: {},
	listeners: {},
};

const handleMessageFromClient = handleMessage(state);

/**
 * Start master process IPC server
 * @param {Object} config - config object to pass to child processes
 * @returns {Promise<number>} - ipc port number
 */
/* istanbul ignore next */
const start = config => {
	const server = net.createServer();

	server.on('connection', socket => {
		socket.id = `con#${++idCount}`;
		state.connections[socket.id] = socket;
		socket.on('data', handleMessageFromClient);
		socket.on('close', () => delete state.connections[socket.id]);
		socket.unref();
		write(socket, messageId.SETUP_SESSION, {config});
	});

	server.on('error', err => {
		if (err.errno === 'EADDRINUSE') {
			throw new SuitestError(
				texts.replFailedToCreateIpc(server.address().port),
				SuitestError.IPC_ERROR
			);
		}

		logger.debug('Error on IPC server', err);
	});

	server.unref();

	return new Promise((resolve, reject) => {
		server.listen(0, 'localhost', err => {
			err ? reject(err) : resolve(server.address().port);
		});
	});
};

module.exports = {
	start,
	addListener: addListener(state),
	removeListener: removeListener(state),
	getState: getState(state),
	broadcast: broadcast(state),
};
