/**
 * Close session suitest method that clear current auth context.
 */

const ipcClient = require('../testLauncher/ipc/client');
const ipcServer = require('../testLauncher/ipc/server');
const chainPromise = require('../utils/chainPromise');
const {sessionClosed, sessionClosing} = require('../texts');

/**
 * @description Clear current auth context.
 * @param {Object} instance of main class
 * @returns {Promise} response object
 */
async function closeSession({webSockets, authContext, appContext, logger}) {
	logger.delayed(sessionClosing());

	// if success, clear auth context, disconnect ws
	webSockets.disconnect();
	ipcClient.disconnect();
	ipcServer.close();
	authContext.clear();
	appContext.clear();

	logger.log(sessionClosed());
}

module.exports = {
	closeSession: chainPromise(closeSession),
	closeSessionUnchained: closeSession,
};
