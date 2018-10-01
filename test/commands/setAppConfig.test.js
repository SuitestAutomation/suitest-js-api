const assert = require('assert');
const sinon = require('sinon');

const testServer = require('../../lib/utils/testServer');

const {appContext, authContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');
const {setAppConfig} = require('../../lib/commands/setAppConfig');
const SuitestError = require('../../lib/utils/SuitestError');
const webSockets = require('../../lib/api/webSockets');
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');
const logger = require('../../lib/utils/logger');

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
		authContext.setContext(sessionConstants.AUTOMATED, 'deviceId');
		await setAppConfig('configId', {url: 'url'});

		assert.deepEqual(appContext.context, {
			configId: 'configId',
			configOverride: {url: 'url'},
		});
	});
});
