/**
 * Close session suitest method allows user to invalidate session token and clear current auth context.
 */

const request = require('../api/request');
const endpoints = require('../api/endpoints');
const {authContext, appContext} = require('../context');
const webSockets = require('../api/webSockets');
const chainPromise = require('../utils/chainPromise');

/**
 * Invalidate session token on server side.
 * Clear current auth context.
 *
 * @returns {Promise} response object
 */
async function closeSession() {
	// authorize and make api request
	const authedRequestObject = await authContext.authorizeHttp(endpoints.sessionClose, {
		method: 'POST',
		body: {
			token: authContext.getToken(),
		},
	}, {commandName: closeSession.name});
	const response = await request(endpoints.sessionClose, authedRequestObject, closeSession.name);

	// if success, clear session context, disconnect ws
	webSockets.disconnect();
	authContext.clear();
	appContext.clear();

	return response;
}

module.exports = chainPromise(closeSession);
