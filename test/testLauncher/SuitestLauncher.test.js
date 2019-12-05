const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const cp = require('child_process');

const testServer = require('../../lib/utils/testServer');
const {authContext} = require('../../lib/context');
const TestLauncher = require('../../lib/testLauncher/SuitestLauncher');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');
const endpoints = require('../../lib/api/endpoints');
const config = require('../../config').config;
const {snippets} = require('../../lib/testLauncher/launcherLogger');
const logger = require('../../lib/utils/logger');
const mockSpawn = require('../../lib/utils/testHelpers/mockSpawn');

describe('SuitestLauncher', () => {
	before(async() => {
		mockSpawn.mock();
		sinon.stub(console, 'error');
		sinon.stub(process, 'exit');
		sinon.stub(logger, 'error');
		sinon.stub(logger, 'debug');
		sinon.stub(logger, 'info');
		sinon.stub(logger, 'log');
		sinon.stub(snippets, 'finalAutomated');
	});

	beforeEach(async() => {
		nock.cleanAll();
		authContext.clear();
		await testServer.restart();
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
		snippets.finalAutomated.restore();
	});

	it('should throw correct error on lack of arguments', async() => {
		const suitestLauncher = new TestLauncher();

		try {
			await suitestLauncher.runAutomatedSession();
			assert.ok(false, 'call runAutomatedSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}

		try {
			await suitestLauncher.runInteractiveSession();
			assert.ok(false, 'call runInteractiveSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}
	});

	it('should throw correct error on invalid json schema', async function() {
		this.timeout(3000);
		const suitestAotomatedLauncher = new TestLauncher({
			tokenKey: 1,
			tokenPassword: 1,
			testPackId: 1,
		});

		try {
			await suitestAotomatedLauncher.runAutomatedSession();
			assert.ok(false, 'call runAutomatedSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}

		const suitestIntaractiveLauncher = new TestLauncher({
			username: 'username',
			password: 'password',
			orgId: 'orgId',
			deviceId: 'deviceId',
			appConfigId: NaN,
		});

		try {
			await suitestIntaractiveLauncher.runInteractiveSession();
			assert.ok(false, 'call runInteractiveSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}
	});

	it('should exit runAutomatedSession when no devices in response', async() => {
		const testNock = nock(config.apiUrl).post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}]))
			.reply(200, {
				deviceAccessToken: 'deviceAccessToken',
				testPack: {devices: []},
			});
		const suitestLauncher = new TestLauncher({
			tokenKey: '1',
			tokenPassword: '1',
			testPackId: 10,
			concurrency: 1,
		}, ['npm', '--version']);

		try {
			await suitestLauncher.runAutomatedSession();
			assert.ok(false, 'call runAutomatedSession success');
		} catch (error) {
			assert.ok(error, 'error');
			assert.ok(testNock.isDone(), 'request');
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}
	});

	it('should exit process if inspect arg provided in automated mode', async function() {
		this.timeout(5000); // give more time to process

		const suitestLauncher = new TestLauncher({
			tokenKey: '1',
			tokenPassword: '1',
			testPackId: 10,
			concurrency: 1,
			inspectBrk: '9121',
		}, ['npm', '--version']);

		try {
			await suitestLauncher.runAutomatedSession();
			assert.ok(false, 'call runAutomatedSession success');
		} catch (error) {
			assert.ok(error, 'error');
			assert(process.exit.calledWith(1));
			assert(logger.error.called);
		}
	});

	it('should exit runAutomatedSession if startTestPack fails', async() => {
		const testNock = nock(config.apiUrl)
			.post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}]))
			.reply(404);
		const suitestLauncher = new TestLauncher({
			tokenKey: '1',
			tokenPassword: '1',
			testPackId: 10,
			concurrency: 1,
		}, ['npm', '--version']);

		await suitestLauncher.runAutomatedSession();
		assert.ok(testNock.isDone(), 'request');
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
	});

	it('should exit runInteractiveSession if openSession fails', async() => {
		cp.spawn.sequence.add(cp.spawn.simple(1));

		const testNock = nock(config.apiUrl).post(endpoints.session).reply(404);
		const suitestLauncher = new TestLauncher({
			username: 'username',
			password: 'password',
			orgId: 'orgId',
			deviceId: 'deviceId',
			appConfigId: 'config',
		}, ['npm', '--version']);

		await suitestLauncher.runInteractiveSession();
		assert.ok(testNock.isDone(), 'request');
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
	});

	it('should exit runInteractiveSession when illegal command provided', async() => {
		const testNock = nock(config.apiUrl).post(endpoints.session).reply(200, {
			deviceAccessToken: 'deviceAccessToken',
		});
		const devicesDetailsNock = nock(config.apiUrl).get(makeUrlFromArray([endpoints.devices, null, {limit: 100}]))
			.reply(200, {
				values: [{deviceId: 'deviceId'}],
			});
		const sessionCloseNock = nock(config.apiUrl).post(endpoints.sessionClose).reply(200, {});
		const suitestLauncher = new TestLauncher({
			username: 'username',
			password: 'password',
			orgId: 'orgId',
			deviceId: 'deviceId',
			appConfigId: 'config',
		}, ['illegalCommand', '--illegalCommand']);

		await suitestLauncher.runInteractiveSession();
		assert.ok(devicesDetailsNock.isDone(), 'device details request');
		assert.ok(testNock.isDone(), 'request');
		assert.ok(sessionCloseNock.isDone(), 'request');
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
	});
});
