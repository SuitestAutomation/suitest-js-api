const assert = require('assert');

const testServer = require('../../lib/utils/testServer');

const {appContext, authContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');
const {setAppConfig} = require('../../lib/commands/setAppConfig');
const SuitestError = require('../../lib/utils/SuitestError');
const webSockets = require('../../lib/api/webSockets');

async function testInputError(...input) {
	try {
		await setAppConfig(...input);
		assert.ok(false, 'setAppConfig success');
	} catch (error) {
		assert.ok(error, 'setAppConfig error');
		assert.strictEqual(error.code, SuitestError.INVALID_INPUT, 'error code');
	}
}

describe('setAppConfig', () => {
	before(async() => {
		await testServer.start();
		await webSockets.connect();
	});
	beforeEach(() => {
		appContext.clear();
		authContext.clear();
	});
	after(async() => {
		await testServer.stop();
		webSockets.disconnect();
		appContext.clear();
		authContext.clear();
	});

	it('should throw correct error on invalid input', () => {
		testInputError();
		testInputError('');
		testInputError('configId', '');
		testInputError('configId', 1);
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
