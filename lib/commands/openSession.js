/**
 * Open session with Suitest server. Set interactive session context.
 */

const sessionConstants = require('../constants/session');
const request = require('../api/request');
const endpoints = require('../api/endpoints');
const {validate, validators} = require('../validation');
const chainPromise = require('../utils/chainPromise');
const SuitestError = require('../utils/SuitestError');
const {invalidInputMessage, authFailed, sessionOpen, sessionOpened} = require('../texts');

/**
 * @param authContext
 * @param webSockets
 * @return {Promise<void>}
 */
async function authAndConnectWS(authContext, webSockets) {
	// authorize ws connection
	const authedWsConnection = await authContext.authorizeWsConnection({}, openSession.name);

	// connect ws
	await webSockets.connect(authedWsConnection);
}

/**
 * Open session with suitest server by username, password.
 * Set interactive session context on success.
 *
 * @param {Object} instance main class instance
 * @param {schema} authData
 * @param {Symbol} _sessionType session type run, for internal use only
 * @returns {Promise} response object
 */
async function openSession({authContext, webSockets, logger}, authData, _sessionType) {
	let authedRequestObject,
		response;

	logger.delayed(sessionOpen(), 4000);

	// validate authData json
	validate(validators.OPEN_SESSION, authData, invalidInputMessage(openSession.name, 'Open session data'));

	if ('username' in authData) {
		// authorize http
		authedRequestObject = await authContext.authorizeHttp(endpoints.session, {
			method: 'POST',
			body: authData,
		}, {type: SuitestError.AUTH_FAILED});
		// make api request
		response = await request(
			endpoints.session,
			authedRequestObject,
			() => new SuitestError(authFailed(), SuitestError.AUTH_FAILED)
		);
		// if success, set interactive session context
		authContext.setContext(sessionConstants.INTERACTIVE, response.deviceAccessToken);

		await authAndConnectWS(authContext, webSockets);
	} else if ('sessionToken' in authData) {
		response = {deviceAccessToken: authData.sessionToken};
		// if sessionToken explicitly provided, set interactive session context
		authContext.setContext(_sessionType || sessionConstants.AUTOMATED, authData.sessionToken);

		await authAndConnectWS(authContext, webSockets);
	} else {
		response = authData;
		// if token credentials provided, simply set access token context
		authContext.setContext(
			sessionConstants.ACCESS_TOKEN,
			authData.accessTokenKey,
			authData.accessTokenPassword
		);
	}

	logger.log(sessionOpened());

	return response;
}

module.exports = {
	openSession: chainPromise(openSession),
	openSessionUnchained: openSession,
};
