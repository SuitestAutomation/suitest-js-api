const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const suitest = require('../../index');

const testServer = require('../../lib/utils/testServer');
const {authContext, logger, config} = suitest;
const webSockets = require('../../lib/api/webSockets');
const startTestPack = (...args) =>
	require('../../lib/commands/startTestPack').startTestPack({...suitest, webSockets}, ...args);
const sessionConstants = require('../../lib/constants/session');
const endpoints = require('../../lib/api/endpoints');
const SuitestError = require('../../lib/utils/SuitestError');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');

describe('startTestPack', () => {
	before(async() => {
		sinon.stub(logger, 'info');
		sinon.stub(logger, 'delayed');
		await testServer.start();
	});

	beforeEach(() => {
		authContext.clear();
	});

	after(async() => {
		logger.info.restore();
		logger.delayed.restore();
		nock.cleanAll();
		authContext.clear();
		await testServer.stop();
	});

	it('should throw correct error on invalid', async() => {
		await testInputErrorAsync(startTestPack, [{invalid: true}]);
	});

	it('should not be authorized in access token context', async() => {
		try {
			await startTestPack({testPackId: 10});
			assert.ok(false, 'success');
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_FAILED, 'error type');
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
			assert.strictEqual(error.code, SuitestError.AUTH_FAILED, 'error type');
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
			assert.strictEqual(res.deviceAccessToken, 'deviceAccessToken', 'deviceAccessToken');
		} catch (error) {
			assert.ok(false, 'error');
		}
	});

	it('should be started accessTokenKey', async() => {
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
			assert.strictEqual(res.deviceAccessToken, 'deviceAccessToken', 'deviceAccessToken');
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
			assert.strictEqual(error.code, 'ENOTFOUND', 'error code');
		}
	});

	it('should throw correct error when test pack not found', () => {
		nock(config.apiUrl).post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}])).reply(404, {});

		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		assert.strictEqual(authContext.context, sessionConstants.ACCESS_TOKEN);

		assertThrowsAsync(
			async() => await startTestPack({testPackId: 10}),
			err => err.code === SuitestError.SERVER_ERROR
		);
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
			assert.strictEqual(error.code, SuitestError.AUTH_FAILED, 'error code');
		}
	});
});
