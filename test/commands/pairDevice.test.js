const assert = require('assert');
const {v1: uuid} = require('uuid');
const nock = require('nock');

const testServer = require('../../lib/utils/testServer');
const sinon = require('sinon');
const suitest = require('../../index');

const sessionConstants = require('../../lib/constants/session');
const webSockets = require('../../lib/api/webSockets');
const {authContext, pairedDeviceContext, logger} = suitest;
const pairDevice = (...args) => require('../../lib/commands/pairDevice').pairDevice({...suitest, webSockets}, ...args);
const SuitestError = require('../../lib/utils/SuitestError');
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');
const stubDeviceInfoFeed = require('../../lib/utils/testHelpers/mockDeviceInfo');

describe('pairDevice', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'delayed');
		await testServer.start();
		await webSockets.connect();
	});

	beforeEach(() => {
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

		authContext.setContext(sessionConstants.GUEST, 'tokenId', 'tokenPass');

		try {
			await pairDevice(deviceId);
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow pairDevice in token session context, set correct device context', async() => {
		const deviceId = uuid();

		stubDeviceInfoFeed(deviceId);
		authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
		try {
			const res = await pairDevice(deviceId);

			assert.ok(res, 'response');
			assert.equal(res.result, 'success', 'response result');
			assert.ok(!!pairedDeviceContext, 'device context set');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});

	it('should allow pairDevice with recording option in token session context', async() => {
		const deviceId = uuid();

		stubDeviceInfoFeed(deviceId);
		authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
		try {
			const res = await pairDevice(deviceId, {recording: 'manualstart'});

			assert.ok(res, 'response');
			assert.equal(res.result, 'success', 'response result');
			assert.ok(!!pairedDeviceContext, 'device context set');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});

	it('should allow pairDevice with recording option with webhookUrl in token session context', async() => {
		const deviceId = uuid();

		stubDeviceInfoFeed(deviceId);
		authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
		try {
			const res = await pairDevice(deviceId, {recording: 'manualstart', webhookUrl: 'https://someUrl'});

			assert.ok(res, 'response');
			assert.equal(res.result, 'success', 'response result');
			assert.ok(!!pairedDeviceContext, 'device context set');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});
});
