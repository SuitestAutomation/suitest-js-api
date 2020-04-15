/**
 * Close session suitest method allows user to invalidate session token and clear current auth context.
 */

const request = require('../api/request');
const endpoints = require('../api/endpoints');
const ipcClient = require('../testLauncher/ipc/client');
const ipcServer = require('../testLauncher/ipc/server');
const chainPromise = require('../utils/chainPromise');
const SuitestError = require('../utils/SuitestError');
const {authNotAllowed, sessionClosed, sessionClosing} = require('../texts');
const envVars = require('../constants/enviroment');

/**
 * Invalidate session token on server side.
 * Clear current auth context.
 * @param {Object} instance of main class
 * @returns {Promise} response object
 */
async function closeSession({webSockets, authContext, appContext, logger, config}) {
	logger.delayed(sessionClosing());

	// don't invalidate tokens in test launcher child processes
	if (!process.env[envVars.SUITEST_CHILD_PROCESS]) {
		// authorize and make api request
		const authedRequestObject = await authContext.authorizeHttp(endpoints.sessionClose, {
			method: 'POST',
			body: {
				token: authContext.getToken(),
			},
		}, {commandName: closeSession.name});

		await request(
			endpoints.sessionClose,
			authedRequestObject,
			() => new SuitestError(
				authNotAllowed(closeSession.name),
				SuitestError.AUTH_NOT_ALLOWED,
				config.logLevel
			)
		);
	}

	// if success, clear session context, disconnect ws
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
