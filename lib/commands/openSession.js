/**
 * Set auth context for current execution.
 */

const sessionConstants = require('../constants/session');
const {validate, validators} = require('../validation');
const chainPromise = require('../utils/chainPromise');
const {
	invalidInputMessage,
	sessionOpen,
	sessionOpened,
} = require('../texts');

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
 *@description Open ws connection with suitest server and setup auth context.
 * @param {Object} instance main class instance
 * @param {Object} authData
 * @param {string} authData.tokenId
 * @param {string} authData.tokenPassword
 * @returns {Promise} response object
 */
async function openSession({authContext, webSockets, logger}, authData) {
	logger.delayed(sessionOpen(), 4000);

	// validate authData json
	validate(validators.OPEN_SESSION, authData, invalidInputMessage(openSession.name, 'Open session data'));

	authContext.setContext(
		sessionConstants.TOKEN,
		authData.tokenId,
		authData.tokenPassword,
	);

	await authAndConnectWS(authContext, webSockets);

	logger.log(sessionOpened());

	return {accessToken: `${authData.tokenId}:${authData.tokenPassword}`};
}

module.exports = {
	openSession: chainPromise(openSession),
	openSessionUnchained: openSession,
};
