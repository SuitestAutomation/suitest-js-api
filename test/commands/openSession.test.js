const assert = require('assert');
const nock = require('nock');

const testServer = require('../../lib/utils/testServer');
const {authContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');
const {openSession} = require('../../lib/commands/openSession');
const endpoints = require('../../lib/api/endpoints');
const SuitestError = require('../../lib/utils/SuitestError');
const {config} = require('../../config');

describe('openSession', () => {
	before(async() => {
		await testServer.start();
	});

	beforeEach(() => {
		authContext.clear();
	});

	after(async() => {
		nock.cleanAll();
		authContext.clear();
		await testServer.stop();
	});

	it('should throw correct error on invalid json schema', async() => {
		try {
			await openSession({invalid: true});

			assert.ok(false, 'open session success');
		} catch (error) {
			assert.ok(error, 'open session error');
			assert.equal(error.code, SuitestError.INVALID_INPUT, 'error type');
		}
	});

	it('should set access token context when token credentials provided', async() => {
		const authData = {
			accessTokenKey: 'accessTokenKey',
			accessTokenPassword: 'accessTokenPassword',
		};

		try {
			const sessionRes = await openSession(authData);

			assert.ok(sessionRes, 'open session response');
			assert.strictEqual(sessionRes.accessTokenKey, authData.accessTokenKey);
			assert.strictEqual(sessionRes.accessTokenPassword, authData.accessTokenPassword);
			assert.strictEqual(authContext.context, sessionConstants.ACCESS_TOKEN, 'access context set');
		} catch (error) {
			assert.ok(false, 'open session error');
		}
	});

	it('should open session for guest context when user credentials provided', async() => {
		const authData = {
			username: 'name',
			password: 'pass',
			orgId: 'id',
		};
		const openSessNock = nock(config.apiUrl).post(endpoints.session, authData)
			.reply(200, {deviceAccessToken: 'deviceAccessToken'});

		try {
			const sessionRes = await openSession(authData);

			assert.ok(openSessNock.isDone(), 'open session request');
			assert.ok(sessionRes, 'open session response');
			assert.equal(sessionRes.deviceAccessToken, 'deviceAccessToken');
			assert.equal(authContext.context, sessionConstants.INTERACTIVE, 'interactive context set');
		} catch (error) {
			assert.ok(false, 'open session error');
		}
	});

	it('should open session for guest context when user sessionToken provided', async() => {
		await testServer.restart();

		const authData = {sessionToken: 'sessionToken'};

		try {
			const sessionRes = await openSession(authData);

			assert.ok(sessionRes, 'open session response');
			assert.equal(sessionRes.deviceAccessToken, 'sessionToken');
			assert.equal(authContext.context, sessionConstants.AUTOMATED, 'automated context set');
		} catch (error) {
			assert.ok(false, 'open session error');
		}
	});

	it('should open session and set Interactive context explicitly when provided as second arg', async() => {
		await testServer.restart();

		const authData = {sessionToken: 'sessionToken'};

		try {
			const sessionRes = await openSession(authData, sessionConstants.INTERACTIVE);

			assert.ok(sessionRes, 'open session response');
			assert.equal(sessionRes.deviceAccessToken, 'sessionToken');
			assert.equal(authContext.context, sessionConstants.INTERACTIVE, 'automated context set');
		} catch (error) {
			assert.ok(false, 'open session error');
		}
	});

	it('should throw correct error on network error', async() => {
		nock(config.apiUrl).post(endpoints.session).replyWithError({'code': 'ENOTFOUND'});
		let sessionInfo;

		try {
			sessionInfo = await openSession({
				username: 'name',
				password: 'pass',
				orgId: 'id',
			});

			assert.ok(false, 'open session success');
		} catch (error) {
			assert.ok(!sessionInfo, 'open session response');
			assert.ok(error, 'open session error');
			assert.equal(error.code, 'ENOTFOUND', 'open session error code');
		}
	});

	it('should throw correct error on server response error', async() => {
		nock(config.apiUrl).post(endpoints.session).reply(403);
		let sessionInfo;

		try {
			sessionInfo = await openSession({
				username: 'name',
				password: 'pass',
				orgId: 'id',
			});

			assert.ok(false, 'open session success');
		} catch (error) {
			assert.ok(!sessionInfo, 'open session response');
			assert.ok(error, 'open session error');
			assert.equal(error.code, SuitestError.SERVER_ERROR, 'open session error code');
		}
	});
});
