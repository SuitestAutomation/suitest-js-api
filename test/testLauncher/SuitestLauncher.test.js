const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const testServer = require('../../lib/utils/testServer');
const {authContext, logger} = require('../../index');
const TestLauncher = require('../../lib/testLauncher/SuitestLauncher');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');
const endpoints = require('../../lib/api/endpoints');
const config = require('../../config');
const {snippets} = require('../../lib/testLauncher/launcherLogger');
const mockSpawn = require('../../lib/utils/testHelpers/mockSpawn');
const webSockets = require('../../lib/api/webSockets');
const suitest = require('../../index');

describe('SuitestLauncher', () => {
	before(async() => {
		mockSpawn.mock();
		sinon.stub(console, 'error');
		sinon.stub(process, 'exit');
		sinon.stub(logger, 'error');
		sinon.stub(logger, 'debug');
		sinon.stub(logger, 'info');
		sinon.stub(logger, 'log');
		sinon.stub(snippets, 'final');
	});

	beforeEach(async() => {
		nock.cleanAll();
		authContext.clear();
		await testServer.restart();
	});

	afterEach(() => {
		logger.error.resetHistory();
	});

	after(async() => {
		mockSpawn.restore();
		await testServer.stop();
		process.exit.restore();
		logger.error.restore();
		logger.log.restore();
		logger.debug.restore();
		logger.info.restore();
		console.error.restore();
		snippets.final.restore();
	});

	it('should throw correct error on lack of arguments', async() => {
		const suitestLauncher = new TestLauncher();

		try {
			await suitestLauncher.runTokenSession();
			assert.ok(false, 'call runTokenSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}

		try {
			await suitestLauncher.runTokenSession();
			assert.ok(false, 'call runTokenSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}
	});

	it('should throw correct error on invalid json schema', async() => {
		const suitestLauncher = new TestLauncher({
			tokenId: 'tokenId',
			tokenPassword: 'tokenPassword',
			deviceId: 'deviceId',
			appConfigId: NaN,
		});

		try {
			await suitestLauncher.runTokenSession();
			assert.ok(false, 'call runTokenSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}
	});

	it('should exit process if inspect arg provided in with several devices', async function() {
		this.timeout(5000); // give more time to process

		const suitestLauncher = new TestLauncher({
			tokenId: '1',
			tokenPassword: '1',
			concurrency: 1,
			inspect: true,
			inspectBrk: '9121',
		}, ['npm', '--version']);

		try {
			await suitestLauncher.runTokenSession();
			assert.ok(false, 'call runTokenSession success');
		} catch (error) {
			assert.ok(error, 'error');
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}
	});

	it('should exit runTokenSession when illegal command provided', async() => {
		const testingDeviceId = 'deviceId';
		const devicesDetailsNock = nock(config.apiUrl).get(makeUrlFromArray([endpoints.device, {deviceId: testingDeviceId}]))
			.reply(200, {});
		const suitestLauncher = new TestLauncher({
			tokenId: 'tokenId',
			tokenPassword: 'tokenPassword',
			deviceId: testingDeviceId,
			appConfigId: 'config',
		}, ['illegalCommand', '--illegalCommand']);

		suitest.webSockets = webSockets;

		await suitestLauncher.runTokenSession();
		assert.ok(devicesDetailsNock.isDone(), 'device details request');
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
	});

	it('should exit runTokenSession when config id, device id and preset were not provided', async() => {
		const suitestLauncher = new TestLauncher({
			tokenId: '1',
			tokenPassword: '1',
		}, ['npm', '--version']);

		await suitestLauncher.runTokenSession();
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
		sinon.assert.calledWith(logger.error, 'Please specify Configuration id and device id, or presets');
	});

	it('should exit runTokenSession when any of specified preset in args not exists in configs', async() => {
		const suitestLauncher = new TestLauncher({
			tokenId: '1',
			tokenPassword: '1',
			preset: ['firstPreset', 'secondPreset', 'thirdPreset', 'fourthPreset'],
			presets: {
				firstPreset: {config: 'config-id1', device: 'device-id1'},
				secondPreset: {config: 'config-id2', device: 'device-id2'},
			},
		}, ['npm', '--version']);

		await suitestLauncher.runTokenSession();
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
		sinon.assert.calledWith(logger.error, 'Presets thirdPreset, fourthPreset were not found in your configuration');
	});

	it('should exit runTokenSession when presets have invalid format', async() => {
		const suitestLauncher = new TestLauncher({
			tokenId: '1',
			tokenPassword: '1',
			preset: ['preset1'],
			presets: {
				preset1: {config: false, device: null},
				preset2: {
					device: 'device-id1',
					config: 'config-id2',
				},
			},
		}, ['npm', '--version']);

		await suitestLauncher.runTokenSession();

		assert(process.exit.calledWith(1));
		assert.match(
			logger.error.firstCall.firstArg.toString(),
			/SuitestError: Invalid input provided for 'suitest token' command/,
		);
	});

	it('should fail with error when provided device id not exists (devices response is empty)', async() => {
		const testingDeviceId = 'unknown-id1';
		const devicesDetailsNock = nock(config.apiUrl)
			.get(makeUrlFromArray([endpoints.device, {deviceId: testingDeviceId}]))
			.reply(404);
		const suitestLauncher = new TestLauncher({
			tokenId: '1',
			tokenPassword: '1',
			deviceId: testingDeviceId,
			appConfigId: 'config-id1',
		}, ['npm', '--version']);

		await suitestLauncher.runTokenSession();

		assert.ok(devicesDetailsNock.isDone(), 'device details request');
		assert(process.exit.calledWith(1));
		assert.match(
			logger.error.firstCall.firstArg.toString(),
			/SuitestError: There are no devices associated with current configuration/,
		);
	});
});
