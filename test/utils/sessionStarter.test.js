const assert = require('assert');
const sinon = require('sinon');
const {v1: uuid} = require('uuid');
const nock = require('nock');
const testServer = require('../../lib/utils/testServer');
const webSockets = require('../../lib/api/webSockets');
const SuitestApi = require('../../suitest');
const sessionStarter = require('../../lib/utils/sessionStarter');
const stubDeviceInfoFeed = require('../../lib/utils/testHelpers/mockDeviceInfo');
const modes = require('../../lib/constants/modes');
const sessionTypes = require('../../lib/constants/modes');

const suitest = new SuitestApi();
const bootstrapSession = (...args) => sessionStarter.bootstrapSession({...suitest, webSockets}, ...args);
const {pairedDeviceContext, authContext, appContext, logger} = suitest;

const deviceId = uuid();

describe('sessionStarter util', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(console, 'error');
		await testServer.start();
	});

	beforeEach(async() => {
		stubDeviceInfoFeed(deviceId);

		sinon.stub(logger, 'error');
		sinon.stub(process, 'exit');

		pairedDeviceContext.clear();
		authContext.clear();
		appContext.clear();
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
	});

	afterEach(() => {
		logger.error.restore();
		process.exit.restore();
	});

	it('should throw with invalid config', async() => {
		await bootstrapSession(deviceId, {sessionType: modes.TOKEN});
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
	});

	it('should bootstrap session with preset', async() => {
		await bootstrapSession(
			{deviceId: 'device1', configId: 'config1', presetName: 'firstPreset'},
			{
				sessionType: sessionTypes.TOKEN,
				tokenId: 'token-id',
				tokenPassword: 'token-password',
				presets: {
					firstPreset: {
						device: 'deviceId',
						config: 'configId',
					},
				},
			},
		);
		assert.deepStrictEqual(
			suitest.appContext.context,
			{
				appId: undefined,
				versionId: undefined,
				configId: 'config1',
				configOverride: {},
			},
		);
	});

	it('should bootstrap session with preset and config override', async() => {
		await bootstrapSession(
			{deviceId: 'device1', configId: 'config1', presetName: 'firstPreset'},
			{
				sessionType: sessionTypes.TOKEN,
				tokenId: 'token-id',
				tokenPassword: 'token-password',
				presets: {
					firstPreset: {
						device: 'deviceId',
						config: {
							configId: 'configId',
							url: 'new url',
							suitestify: false,
						},
					},
				},
			},
		);
		assert.deepStrictEqual(
			suitest.appContext.context,
			{
				appId: undefined,
				versionId: undefined,
				configId: 'config1',
				configOverride: {
					url: 'new url',
					suitestify: false,
				},
			},
		);
	});
});
