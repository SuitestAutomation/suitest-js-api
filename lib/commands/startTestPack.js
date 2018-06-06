/**
 * Suitest method to start test pack run and generate session token.
 */

const {omit} = require('ramda');

const sessionConstants = require('../constants/session');
const request = require('../api/request');
const endpoints = require('../api/endpoints');
const {authContext} = require('../context');
const webSockets = require('../api/webSockets');
const {validate, validators} = require('../validataion');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, authFailed, testPackWillBeStarted, testPackWasStarted} = require('../texts');
const SuitestError = require('../utils/SuitestError');
const logger = require('../utils/logger');

/**
 * Start test pack on suitest server by testPackId.
 * Set automated session context on success.
 *
 * @param {schema} testPackData
 * @returns {Promise} response object
 */
async function startTestPack(testPackData) {
	logger.info(testPackWillBeStarted(testPackData.testPackId));
	// validate authData json
	validate(
		validators.START_TEST_PACK,
		testPackData,
		invalidInputMessage('startTestPack', 'TestPack data'),
	);

	// if token key and pass explicitly provided, set corresponding access token
	if ('accessTokenKey' in testPackData && 'accessTokenPassword' in testPackData) {
		authContext.setContext(
			sessionConstants.ACCESS_TOKEN,
			testPackData.accessTokenKey,
			testPackData.accessTokenPassword
		);
	}

	// authorize
	const authedRequestObject = await authContext.authorizeHttp(endpoints.testPackGenTokens, {
		method: 'POST',
		body: omit(
			['testPackId', 'accessTokenKey', 'accessTokenPassword'],
			testPackData
		),
	}, {type: SuitestError.AUTH_FAILED});

	// make api request
	const response = await request(
		[endpoints.testPackGenTokens, {id: testPackData.testPackId}],
		authedRequestObject,
		() => new SuitestError(authFailed(), SuitestError.AUTH_FAILED),
	);

	// if success, set interactive session context
	authContext.setContext(sessionConstants.AUTOMATED, response.deviceAccessToken);

	// authorizw ws connection
	const authedWsConnection = await authContext.authorizeWsConnection({}, startTestPack.name);

	// connect ws
	await webSockets.connect(authedWsConnection);
	logger.info(testPackWasStarted(testPackData.testPackId));

	return response;
}

module.exports = {
	startTestPack: chainPromise(startTestPack),
	startTestPackUnchained: startTestPack,
};
