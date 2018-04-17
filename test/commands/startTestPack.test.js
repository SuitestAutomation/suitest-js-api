const assert = require('assert');
const nock = require('nock');

const testServer = require('../../lib/utils/testServer');
const {authContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');
const startTestPack = require('../../lib/commands/startTestPack');
const endpoints = require('../../lib/api/endpoints');
const SuitestError = require('../../lib/utils/SuitestError');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');
const {config} = require('../../config');

describe('startTestPack', () => {
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
			await startTestPack({invalid: true});

			assert.ok(false, 'open session success');
		} catch (error) {
			assert.ok(error, 'open session error');
			assert.equal(error.code, SuitestError.INVALID_INPUT, 'error type');
		}
	});

	it('should not be authorized in access token context', async() => {
		try {
			await startTestPack({testPackId: 10});
			assert.ok(false, 'success');
		} catch (error) {
			assert.ok(error, 'error');
			assert.equal(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error type');
		}
	});

	it('should not be authorized in interactive session context', async() => {
		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId', 'tokenPass');
		assert.strictEqual(authContext.context, sessionConstants.INTERACTIVE);

		try {
			await startTestPack({testPackId: 10});
			assert.ok(false, 'success');
		} catch (error) {
			assert.ok(error, 'error');
			assert.equal(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error type');
		}
	});

	it('should be started in access token context', async() => {
		const testNock = nock(config.apiUrl).post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}]))
			.reply(200, {deviceAccessToken: 'deviceAccessToken'});
		let res;

		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		assert.strictEqual(authContext.context, sessionConstants.ACCESS_TOKEN);

		try {
			res = await startTestPack({
				testPackId: 10,
				config: {},
				metadata: {},
			});
			assert.ok(testNock.isDone(), 'request');
			assert.ok(res, 'response');
			assert.strictEqual(authContext.context, sessionConstants.AUTOMATED, 'automated session context set');
			assert.equal(res.deviceAccessToken, 'deviceAccessToken', 'deviceAccessToken');
		} catch (error) {
			assert.ok(false, 'error');
		}
	});

	it('should be started accessTokenKey', async() => {
		await testServer.restart();
		const testNock = nock(config.apiUrl).post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}]))
			.reply(200, {deviceAccessToken: 'deviceAccessToken'});
		let res;

		try {
			res = await startTestPack({
				testPackId: 10,
				accessTokenKey: 'someAccessToke',
				accessTokenPassword: 'somePasswordToAccessTken',
				config: {},
				metadata: {},
			});
			assert.ok(testNock.isDone(), 'request');
			assert.ok(res, 'response');
			assert.strictEqual(authContext.context, sessionConstants.AUTOMATED, 'automated session context set');
			assert.equal(res.deviceAccessToken, 'deviceAccessToken', 'deviceAccessToken');
		} catch (error) {
			assert.ok(false, 'error');
		}
	});

	it('should throw correct error on network error', async() => {
		nock(config.apiUrl).post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}]))
			.replyWithError({'code': 'ENOTFOUND'});

		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		assert.strictEqual(authContext.context, sessionConstants.ACCESS_TOKEN);

		try {
			await startTestPack({testPackId: 10});
			assert.ok(false, 'success');
		} catch (error) {
			assert.ok(error, 'error');
			assert.equal(error.code, 'ENOTFOUND', 'error code');
		}
	});

	it('should throw correct error on server response error', async() => {
		nock(config.apiUrl).post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}])).reply(500);

		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		assert.strictEqual(authContext.context, sessionConstants.ACCESS_TOKEN);

		try {
			await startTestPack({testPackId: 10});
			assert.ok(false, 'success');
		} catch (error) {
			assert.ok(error, 'error');
			assert.equal(error.code, SuitestError.SERVER_ERROR, 'error code');
		}
	});
});
