/**
 * IPC client - child process
 */

const net = require('net');
const {write, getState, addListener, removeListener, handleMessage} = require('./ipcHelper');

const state = {
	socket: null,
	listeners: {},
};

const handleMessageFromServer = handleMessage(state);

const disconnect = () => {
	if (state.socket) {
		state.socket.end();
		state.socket.destroy();
		state.socket = null;
	}
};

/**
 * Connect child process to launcher IPC server
 * @param {number} port - ipc port number
 */
/* istanbul ignore next */
const connect = (port) => {
	state.socket = net.connect(port, 'localhost');
	state.socket.on('error', err => console.debug('IPC client socket error', err.errno));
	state.socket.on('close', disconnect);
	state.socket.on('data', handleMessageFromServer);
};

module.exports = {
	connect,
	disconnect,
	addListener: addListener(state),
	removeListener: removeListener(state),
	getState: getState(state),
	write: (msgId, data) => write(state.socket, msgId, data),
};
