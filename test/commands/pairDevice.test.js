const assert = require('assert');
const uuid = require('uuid/v1');
const nock = require('nock');

const testServer = require('../../lib/utils/testServer');
const sinon = require('sinon');

const sessionConstants = require('../../lib/constants/session');
const {authContext, pairedDeviceContext} = require('../../lib/context');
const {pairDevice} = require('../../lib/commands/pairDevice');
const SuitestError = require('../../lib/utils/SuitestError');
const webSockets = require('../../lib/api/webSockets');
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');
const logger = require('../../lib/utils/logger');
const stubDeviceInfoFeed = require('../../lib/utils/testHelpers/mockDeviceInfo');

describe('pairDevice', () => {
	before(async() => {
		sinon.stub(logger, 'info');
		await testServer.start();
		await webSockets.connect();
	});

	beforeEach(() => {
		pairedDeviceContext.clear();
		authContext.clear();
	});

	after(async() => {
		logger.info.restore();
		await testServer.stop();
		pairedDeviceContext.clear();
		authContext.clear();
		webSockets.disconnect();
		nock.cleanAll();
	});

	it('should throw correct error on invalid input', async() => {
		await testInputErrorAsync(pairDevice, ['nonUuidForamt', {}]);
	});

	it('should not allow pairDevice command in guest, access token contexts', async() => {
		const deviceId = uuid();

		try {
			await pairDevice(uuid());
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}

		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		stubDeviceInfoFeed(deviceId);

		try {
			await pairDevice(deviceId);
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow pairDevice in automated and interactive session context, set correct device context', async() => {
		const deviceId = uuid();

		stubDeviceInfoFeed(deviceId);
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
		stubDeviceInfoFeed(deviceId);

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
