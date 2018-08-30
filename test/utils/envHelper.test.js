const assert = require('assert');
const sinon = require('sinon');
const uuid = require('uuid/v1');

const envHelper = require('../../lib/utils/envHelper');
const testServer = require('../../lib/utils/testServer');
const envVars = require('../../lib/constants/enviroment');
const webSockets = require('../../lib/api/webSockets');
const {pairedDeviceContext, authContext, appContext, testContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');
const nock = require('nock');
const stubDeviceInfoFeed = require('../../lib/utils/testHelpers/mockDeviceInfo');

const deviceId = uuid();

describe('envHelper.js', () => {
	before(async() => {
		await testServer.start();
	});

	beforeEach(async() => {
		await testServer.restart();
		stubDeviceInfoFeed(deviceId);

		pairedDeviceContext.clear();
		authContext.clear();
		appContext.clear();
		testContext.clear();
	});

	after(async() => {
		webSockets.disconnect();
		await testServer.stop();
		nock.cleanAll();

		pairedDeviceContext.clear();
		authContext.clear();
		appContext.clear();
		testContext.clear();

		delete process.env[envVars.SUITEST_SESSION_TYPE];
		delete process.env[envVars.SUITEST_SESSION_TOKEN];
		delete process.env[envVars.SUITEST_DEVICE_ID];
		delete process.env[envVars.SUITEST_APP_CONFIG_ID];
		delete process.env[envVars.SUITEST_DEBUG_MODE];
	});

	it('should read data from env, launch automated session and pair to device', async() => {
		process.env[envVars.SUITEST_SESSION_TYPE] = 'automated';
		process.env[envVars.SUITEST_SESSION_TOKEN] = 'token';
		process.env[envVars.SUITEST_DEVICE_ID] = deviceId;

		const res = await envHelper.handleUserEnvVar();

		await assert.strictEqual(res, undefined);
	});

	it('should read data from env, launch interactive session, pair to device, set app config', async() => {

		process.env[envVars.SUITEST_SESSION_TYPE] = 'interactive';
		process.env[envVars.SUITEST_SESSION_TOKEN] = 'token';
		process.env[envVars.SUITEST_DEVICE_ID] = deviceId;
		process.env[envVars.SUITEST_APP_CONFIG_ID] = 'configId';

		const res = await envHelper.handleUserEnvVar();

		await assert.strictEqual(res, undefined);
		await assert.strictEqual(authContext.context, sessionConstants.INTERACTIVE);
		await assert.strictEqual(appContext.context.configId, 'configId');
		await assert.strictEqual(pairedDeviceContext.context.deviceId, deviceId);
	});

	it('should launch interactive session in debug mode and send enableDebugMode ws request', async() => {


		process.env[envVars.SUITEST_SESSION_TYPE] = 'interactive';
		process.env[envVars.SUITEST_SESSION_TOKEN] = 'token';
		process.env[envVars.SUITEST_DEVICE_ID] = deviceId;
		process.env[envVars.SUITEST_APP_CONFIG_ID] = 'configId';
		process.env[envVars.SUITEST_DEBUG_MODE] = 'yes';

		const res = await envHelper.handleUserEnvVar();

		await assert.strictEqual(res, undefined);
		await assert.strictEqual(authContext.context, sessionConstants.INTERACTIVE);
		await assert.strictEqual(appContext.context.configId, 'configId');
		await assert.strictEqual(pairedDeviceContext.context.deviceId, deviceId);
	});

	it('should throw error for invalid SUITEST_SESSION_TYPE', async() => {
		sinon.stub(process, 'exit');
		sinon.stub(console, 'log');

		process.env[envVars.SUITEST_SESSION_TYPE] = undefined;

		await envHelper.handleUserEnvVar();

		assert(process.exit.calledWith(1));
		assert(process.exit.called);

		process.env[envVars.SUITEST_SESSION_TYPE] = 'invalid';

		await envHelper.handleUserEnvVar();

		assert(process.exit.calledWith(1));
		assert(process.exit.called);

		process.exit.restore();
		console.log.restore();
	});
});
