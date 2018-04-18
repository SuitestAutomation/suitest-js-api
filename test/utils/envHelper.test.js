const assert = require('assert');
const sinon = require('sinon');
const uuid = require('uuid/v1');

const envHelper = require('../../lib/utils/envHelper');
const testServer = require('../../lib/utils/testServer');
const envVars = require('../../lib/constants/enviroment');
const webSockets = require('../../lib/api/webSockets');
const {pairedDeviceContext, authContext, appContext, testContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');

describe('envHelper.js', () => {
	before(async() => {
		await testServer.start();
	});

	beforeEach(async() => {
		await testServer.restart();

		pairedDeviceContext.clear();
		authContext.clear();
		appContext.clear();
		testContext.clear();
	});

	after(async() => {
		webSockets.disconnect();
		await testServer.stop();

		pairedDeviceContext.clear();
		authContext.clear();
		appContext.clear();
		testContext.clear();

		process.env[envVars.SUITEST_SESSION_TYPE] = undefined;
		process.env[envVars.SUITEST_SESSION_TOKEN] = undefined;
		process.env[envVars.SUITEST_DEVICE_ID] = undefined;
		process.env[envVars.SUITEST_APP_CONFIG_ID] = undefined;
	});

	it('should read data from env, launch automated session and pair to device', async() => {
		process.env[envVars.SUITEST_SESSION_TYPE] = 'automated';
		process.env[envVars.SUITEST_SESSION_TOKEN] = 'token';
		process.env[envVars.SUITEST_DEVICE_ID] = uuid();

		const res = await envHelper.handleUserEnvVar();

		await assert.strictEqual(res, undefined);
	});

	it('should read data from env, launch interactive session, pair to device, set app config', async() => {
		const deviceId = uuid();

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

	it('should exit process correctly', async() => {
		sinon.stub(process, 'exit');
		sinon.stub(console, 'error');
		sinon.stub(webSockets, 'disconnect');

		envHelper.exit();

		assert(process.exit.calledWith(1));
		assert(console.error.called);
		assert(webSockets.disconnect.called);

		process.exit.restore();
		console.error.restore();
		webSockets.disconnect.restore();
	});
});
