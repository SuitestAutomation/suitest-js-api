/**
 * Open session with Suitest server. Set interactive session context.
 */

const sessionConstants = require('../constants/session');
const request = require('../api/request');
const endpoints = require('../api/endpoints');
const {validate, validators} = require('../validataion');
const {authContext} = require('../context');
const webSockets = require('../api/webSockets');
const chainPromise = require('../utils/chainPromise');
const SuitestError = require('../utils/SuitestError');
const {invalidInputMessage, authFailed, commandExecuted, commandWillBeExecuted} = require('../texts');
const logger = require('../utils/logger');
const {stackTraceWrapper} = require('../utils/stackTraceParser');

async function authAndConnectWS() {
	// authorize ws connection
	const authedWsConnection = await authContext.authorizeWsConnection({}, openSession.name);

	// connect ws
	await webSockets.connect(authedWsConnection);
}

/**
 * Open session with suitest server by username, password.
 * Set interactive session context on success.
 *
 * @param {schema} authData
 * @param {Symbol} _sessionType session type run, for internal use only
 * @returns {Promise} response object
 */
async function openSession(authData, _sessionType) {
	let authedRequestObject,
		response;

	logger.info(commandWillBeExecuted('openSession'));
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

		await authAndConnectWS();
	} else if ('sessionToken' in authData) {
		response = {deviceAccessToken: authData.sessionToken};
		// if sessionToken explicitly provided, set interactive session context
		authContext.setContext(_sessionType || sessionConstants.AUTOMATED, authData.sessionToken);

		await authAndConnectWS();
	} else {
		response = authData;
		// if token credentials provided, simply set access token context
		authContext.setContext(
			sessionConstants.ACCESS_TOKEN,
			authData.accessTokenKey,
			authData.accessTokenPassword
		);
	}

	logger.info(commandExecuted('openSession'));

	return response;
}

module.exports = {
	openSession: chainPromise(stackTraceWrapper(openSession)),
	openSessionUnchained: openSession,
};
