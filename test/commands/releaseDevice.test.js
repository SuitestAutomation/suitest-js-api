const assert = require('assert');
const testServer = require('../../lib/utils/testServer');
const sinon = require('sinon');
const suitest = require('../../index');

const sessionConstants = require('../../lib/constants/session');
const webSockets = require('../../lib/api/webSockets');
const {authContext, pairedDeviceContext, logger} = suitest;
const releaseDevice = () => require('../../lib/commands/releaseDevice')({...suitest, webSockets});
const SuitestError = require('../../lib/utils/SuitestError');

describe('releaseDevice', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'delayed');
		await testServer.start();
		await webSockets.connect();
	});

	beforeEach(async() => {
		pairedDeviceContext.clear();
		authContext.clear();
	});

	after(async() => {
		logger.log.restore();
		logger.delayed.restore();
		await testServer.stop();
		pairedDeviceContext.clear();
		authContext.clear();
		webSockets.disconnect();
	});

	it('should not allow releaseDevice command in guest, access token contexts', async() => {
		try {
			await releaseDevice();
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		try {
			await releaseDevice();
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow releaseDevice in automated and interactive session context, clear device context', async() => {
		pairedDeviceContext.setContext('someContext');
		authContext.setContext(sessionConstants.AUTOMATED, 'tokenId');
		assert.strictEqual(pairedDeviceContext.context, 'someContext', 'device context set');
		try {
			const res = await releaseDevice();

			assert.ok(!res, 'response void');
			assert.strictEqual(pairedDeviceContext.context, null, 'device context cleared');
		} catch (error) {
			assert.ok(!error, 'error');
		}

		pairedDeviceContext.setContext('someContext');
		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');
		assert.strictEqual(pairedDeviceContext.context, 'someContext', 'device context set');
		try {
			const res = await releaseDevice();

			assert.ok(!res, 'response void');
			assert.strictEqual(pairedDeviceContext.context, null, 'device context cleared');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});
});
