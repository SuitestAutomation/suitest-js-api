const assert = require('assert');

const sessionConstants = require('../../lib/constants/session');
const SuitestError = require('../../lib/utils/SuitestError');
const endpoints = require('../../lib/api/endpoints');
const {authContext} = require('../../index');

describe('authContext', () => {
	it('should have context getter, setContext and authorize methods', () => {
		assert.ok('context' in authContext);
		assert.ok('setContext' in authContext);
		assert.ok('authorizeHttp' in authContext);
		assert.ok('authorizeWs' in authContext);
	});

	it('should set authorization header and allow request with proper headers for "token" session context', async() => {
		authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
		const authedReqObject = await authContext.authorizeHttp(endpoints.devices, {method: 'GET'});

		assert.ok(authedReqObject, 'authed');
		assert.strictEqual(
			authedReqObject.headers['Authorization'],
			`Basic ${Buffer.from('tokenId:tokenPassword').toString('base64')}`,
		);
	});

	it('should not allow auth and throw correct error type for guest context', async() => {
		let authedReqObject;

		authContext.setContext(sessionConstants.GUEST);
		try {
			authedReqObject = await authContext.authorizeHttp(endpoints.testRun, {method: 'GET'});
		} catch (error) {
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}

		try {
			await authContext.authorizeHttp(
				endpoints.testRun,
				{method: 'GET'},
				{
					commandName: 'testRun',
					type: SuitestError.AUTH_FAILED,
				},
			);
		} catch (error) {
			assert.equal(error.code, SuitestError.AUTH_FAILED, 'error code');
			assert.equal(
				error.message,
				'You\'re not allowed to execute .testRun function. ' +
				'Make sure you\'re logged in with the correct credentials.',
				'error code');
		}
		assert.ok(!authedReqObject, 'authed');
	});

	it('should not allow auth when request key is allowed but method type is not', async() => {
		let authedReqObject;

		authContext.setContext(sessionConstants.TOKEN);

		try {
			authedReqObject = await authContext.authorizeHttp(endpoints.apps, {method: 'DELETE'});
		} catch (error) {
			assert.equal(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}

		assert.ok(!authedReqObject, 'authed');
	});

	it('should throw exception in guest session context', async() => {
		authContext.setContext(sessionConstants.GUEST, 'tokenId');

		try {
			await authContext.authorizeWsConnection({});
			assert.ok(false, 'Exception should be thrown');
		} catch (e) {
			assert.ok(true, 'error');
		}
	});

	after(() => {
		authContext.setContext(sessionConstants.GUEST);
	});
});
