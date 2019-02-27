const assert = require('assert');
const sinon = require('sinon');
const uuid = require('uuid/v1');

const {bootstrapSession} = require('../../lib/utils/sessionStarter');
const testServer = require('../../lib/utils/testServer');
const webSockets = require('../../lib/api/webSockets');
const {pairedDeviceContext, authContext, appContext, testContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');
const logger = require('../../lib/utils/logger');
const nock = require('nock');
const stubDeviceInfoFeed = require('../../lib/utils/testHelpers/mockDeviceInfo');

const deviceId = uuid();

describe('sessionStarter.js', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(console, 'error');
		await testServer.start();
	});

	beforeEach(async() => {
		stubDeviceInfoFeed(deviceId);

		pairedDeviceContext.clear();
		authContext.clear();
		appContext.clear();
		testContext.clear();
	});

	after(async() => {
		logger.log.restore();
		console.error.restore();

		webSockets.disconnect();
		await testServer.stop();
		nock.cleanAll();

		pairedDeviceContext.clear();
		authContext.clear();
		appContext.clear();
		testContext.clear();
	});

	it('should launch automated session and pair to device', async() => {
		const res = await bootstrapSession({
			sessionType: 'automated',
			sessionToken: 'token',
			deviceId,
		});

		await assert.strictEqual(res, undefined);
	});

	it('should launch interactive session, pair to device, set app config', async() => {
		const res = await bootstrapSession({
			sessionType: 'interactive',
			sessionToken: 'token',
			deviceId,
			appConfigId: 'configId',
		});

		await assert.strictEqual(res, undefined);
		await assert.strictEqual(authContext.context, sessionConstants.INTERACTIVE);
		await assert.strictEqual(appContext.context.configId, 'configId');
		await assert.strictEqual(pairedDeviceContext.context.deviceId, deviceId);
	});

	it('should launch interactive session in debug mode and send enableDebugMode ws request', async() => {
		const res = await bootstrapSession({
			sessionType: 'interactive',
			sessionToken: 'token',
			deviceId,
			appConfigId: 'configId',
			isDebugMode: true,
		});

		await assert.strictEqual(res, undefined);
		await assert.strictEqual(authContext.context, sessionConstants.INTERACTIVE);
		await assert.strictEqual(appContext.context.configId, 'configId');
		await assert.strictEqual(pairedDeviceContext.context.deviceId, deviceId);
	});
});
