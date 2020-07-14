/**
 * Suitest method to start test pack run and generate session token.
 */

const {omit} = require('ramda');

const sessionConstants = require('../constants/session');
const request = require('../api/request');
const endpoints = require('../api/endpoints');
const {authContext} = require('../context');
const webSockets = require('../api/webSockets');
const {validate, validators} = require('../validation');
const chainPromise = require('../utils/chainPromise');
const {
	invalidInputMessage,
	authFailedAutomated,
	testPackWillBeStarted,
	testPackWasStarted,
	testPackNotFound,
} = require('../texts');
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
	const tpData = {
		includeChangelist: false,
		...testPackData,
	};

	logger.delayed(testPackWillBeStarted(tpData.testPackId));
	// validate authData json
	validate(
		validators.START_TEST_PACK,
		tpData,
		invalidInputMessage('startTestPack', 'TestPack data'),
	);

	// if token key and pass explicitly provided, set corresponding access token
	if ('accessTokenKey' in tpData && 'accessTokenPassword' in tpData) {
		authContext.setContext(
			sessionConstants.ACCESS_TOKEN,
			tpData.accessTokenKey,
			tpData.accessTokenPassword
		);
	}

	// authorize
	const authedRequestObject = await authContext.authorizeHttp(endpoints.testPackGenTokens, {
		method: 'POST',
		body: omit(
			['testPackId', 'accessTokenKey', 'accessTokenPassword'],
			tpData
		),
	}, {type: SuitestError.AUTH_FAILED});

	// make api request
	const response = await request(
		[endpoints.testPackGenTokens, {id: tpData.testPackId}],
		authedRequestObject,
		err => new SuitestError(...(
			err.status === 404
				? [testPackNotFound(tpData.testPackId), SuitestError.SERVER_ERROR]
				: [authFailedAutomated(), SuitestError.AUTH_FAILED]
		)),
	);

	// if success, set interactive session context
	authContext.setContext(sessionConstants.AUTOMATED, response.deviceAccessToken);

	// authorize ws connection
	const authedWsConnection = await authContext.authorizeWsConnection({}, startTestPack.name);

	// connect ws
	await webSockets.connect(authedWsConnection);
	logger.delayed(testPackWasStarted(tpData.testPackId));

	return response;
}

module.exports = {
	startTestPack: chainPromise(startTestPack),
	startTestPackUnchained: startTestPack,
};
