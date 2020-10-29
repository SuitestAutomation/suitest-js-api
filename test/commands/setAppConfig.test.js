const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');

const testServer = require('../../lib/utils/testServer');

const {appContext, authContext, logger} = suitest;
const webSockets = require('../../lib/api/webSockets');
const setAppConfig = (...args) =>
	require('../../lib/commands/setAppConfig').setAppConfig({...suitest, webSockets}, ...args);
const sessionConstants = require('../../lib/constants/session');
const SuitestError = require('../../lib/utils/SuitestError');
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');
const mockWebSocket = require('../../lib/utils/testHelpers/mockWebSocket');

describe('setAppConfig', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'json');
		sinon.stub(logger, 'delayed');
		await testServer.start();
		await webSockets.connect();
	});
	beforeEach(() => {
		appContext.clear();
		authContext.clear();
	});
	after(async() => {
		logger.log.restore();
		logger.json.restore();
		logger.delayed.restore();
		await testServer.stop();
		webSockets.disconnect();
		appContext.clear();
		authContext.clear();
	});
	afterEach(() => {
		mockWebSocket.restoreResponse();
	});

	it('should throw correct error on invalid input', async() => {
		await testInputErrorAsync(setAppConfig);
		await testInputErrorAsync(setAppConfig, ['']);
		await testInputErrorAsync(setAppConfig, ['configId', '']);
		await testInputErrorAsync(setAppConfig, ['configId', 1]);
	});

	it('should not be allowed in GUEST context', async() => {
		try {
			await setAppConfig('configId', {url: 'url'});
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should set correct app config', async() => {
		mockWebSocket.mockResponse({
			appId: 'appId',
			versionId: 'versionId',
		});
		authContext.setContext(sessionConstants.AUTOMATED, 'deviceId');
		await setAppConfig('configId', {url: 'url'});

		assert.deepEqual(appContext.context, {
			appId: 'appId',
			versionId: 'versionId',
			configId: 'configId',
			configOverride: {url: 'url'},
		});
	});
});
