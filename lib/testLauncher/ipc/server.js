/**
 * IPC server - launcher process
 */

const net = require('net');
const texts = require('../../texts');
const SuitestError = require('../../utils/SuitestError');
const messageId = require('../../constants/ipcMessageId');
const {write, getState, addListener, removeListener, handleMessage, broadcast} = require('./ipcHelper');

let idCount = 0;

const state = {
	server: null,
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

	state.server = server;

	server.on('connection', socket => {
		socket.id = `con#${++idCount}`;
		state.connections[socket.id] = socket;
		socket.on('error', err => console.debug('IPC server socket error', err.errno));
		socket.on('close', () => delete state.connections[socket.id]);
		socket.on('data', handleMessageFromClient);
		socket.unref();
		write(socket, messageId.SETUP_SESSION, {config});
	});

	server.on('error', err => {
		if (err.errno === 'EADDRINUSE') {
			throw new SuitestError(
				texts.ipcFailedToCreateServer(server.address().port),
				SuitestError.IPC_ERROR
			);
		}

		console.debug('IPC server error', err.errno);
	});

	server.unref();

	return new Promise((resolve, reject) => {
		server.listen(0, 'localhost', err => {
			err ? reject(err) : resolve(server.address().port);
		});
	});
};

const close = () => {
	if (state.server) {
		state.server.close();
		state.server = null;
	}
};

module.exports = {
	start,
	close,
	addListener: addListener(state),
	removeListener: removeListener(state),
	getState: getState(state),
	broadcast: broadcast(state),
};
