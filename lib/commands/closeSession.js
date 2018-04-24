/**
 * Close session suitest method allows user to invalidate session token and clear current auth context.
 */

const request = require('../api/request');
const endpoints = require('../api/endpoints');
const {authContext, appContext} = require('../context');
const webSockets = require('../api/webSockets');
const chainPromise = require('../utils/chainPromise');
const envVars = require('../constants/enviroment');
const SuitestError = require('../utils/SuitestError');
const {authNotAllowed} = require('../texts');

/**
 * Invalidate session token on server side.
 * Clear current auth context.
 *
 * @returns {Promise} response object
 */
async function closeSession() {
	// don't invalidate tokens in test launcher child processes
	if (!process.env[envVars.SUITEST_LAUNCHER_PROCESS]) {
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
				SuitestError.AUTH_NOT_ALLOWED
			)
		);
	}

	// if success, clear session context, disconnect ws
	webSockets.disconnect();
	authContext.clear();
	appContext.clear();
}

module.exports = chainPromise(closeSession);
