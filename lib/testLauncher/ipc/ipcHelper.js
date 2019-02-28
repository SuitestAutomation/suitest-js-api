/**
 * Write IPC message
 * @param {net.Socket} socket - socket to write
 * @param {string} messageId - message identifier
 * @param {Object} [data] - additional data
 */
const write = (socket, messageId, data = {}) => {
	socket.write(JSON.stringify({
		id: messageId,
		data,
	}));
};

/**
 * Write IPC message to all connections
 * @param {Object} state - server | client state
 * @param {string} messageId - message identifier
 * @param {Object} [data] - additional data
 */
const broadcast = state => (messageId, data = {}) => {
	Object.values(state.connections).forEach(s => write(s, messageId, data));
};

/**
 * Handle incoming socket message
 * @param {Object} state - server | client state
 * @param {Buffer} chunk
 */
const handleMessage = state => chunk => {
	const {id, data} = JSON.parse(chunk.toString());

	if (state.listeners[id]) {
		state.listeners[id](data);
	}
};

/**
 * Add socket message listener function
 * @param {Object} state - server | client state
 * @param {string} msgId - messaage id
 * @param {Function} callback
 */
const addListener = state => (msgId, callback) => {
	state.listeners[msgId] = callback;
};

/**
 * Remove socket message listener
 * @param {Object} state - server | client state
 * @param {string} msgId - messaage id
 */
const removeListener = state => msgId => {
	delete state.listeners[msgId];
};

/**
 * Get server | client state
 */
const getState = state => () => ({...state});

module.exports = {
	getState,
	addListener,
	removeListener,
	write,
	broadcast,
	handleMessage,
};
