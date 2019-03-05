/**
 * IPC client - child process
 */

const net = require('net');
const logger = require('../../utils/logger');
const {write, getState, addListener, removeListener, handleMessage} = require('./ipcHelper');

const state = {
	socket: null,
	listeners: {},
};

const handleMessageFromServer = handleMessage(state);

/**
 * Connect child process to launcher IPC server
 * @param {number} port - ipc port number
 */
/* istanbul ignore next */
const connect = (port) => {
	state.socket = net.connect(port, 'localhost');
	state.socket.on('error', err => logger.debug('IPC client socket error', err));
	state.socket.on('close', () => state.socket = null);
	state.socket.on('data', handleMessageFromServer);
};

module.exports = {
	connect,
	addListener: addListener(state),
	removeListener: removeListener(state),
	getState: getState(state),
	write: (msgId, data) => write(state.socket, msgId, data),
};
