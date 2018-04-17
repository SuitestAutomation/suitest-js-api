const assert = require('assert');
const testServer = require('../../lib/utils/testServer');

const sessionConstants = require('../../lib/constants/session');
const {authContext, pairedDeviceContext} = require('../../lib/context');
const {pairDevice} = require('../../lib/commands/pairDevice');
const SuitestError = require('../../lib/utils/SuitestError');
const webSockets = require('../../lib/api/webSockets');
const uuid = require('uuid/v1');

describe('pairDevice', () => {
	before(async() => {
		await testServer.start();
		await webSockets.connect();
	});

	beforeEach(() => {
		pairedDeviceContext.clear();
		authContext.clear();
	});

	after(async() => {
		await testServer.stop();
		pairedDeviceContext.clear();
		authContext.clear();
		webSockets.disconnect();
	});

	it('should not allow pairDevice with invalid deviceId', async() => {
		try {
			await pairDevice('nonUuidForamt', {});
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.INVALID_INPUT, 'error code');
		}
	});

	it('should not allow pairDevice command in guest, access token contexts', async() => {
		try {
			await pairDevice(uuid());
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		try {
			await pairDevice(uuid());
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow pairDevice in automated and interactive session context, set correct device context', async() => {
		const deviceId = uuid();

		authContext.setContext(sessionConstants.AUTOMATED, 'tokenId');
		try {
			const res = await pairDevice(deviceId);

			assert.ok(res, 'response');
			assert.equal(res.result, 'success', 'response result');
			assert.ok(!!pairedDeviceContext, 'device context set');
		} catch (error) {
			assert.ok(!error, 'error');
		}

		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');
		try {
			const res = await pairDevice(deviceId);

			assert.ok(res, 'response');
			assert.equal(res.result, 'success', 'response result');
			assert.ok(!!pairedDeviceContext, 'device context set');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});
});
