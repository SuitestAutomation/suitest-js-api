const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');

const testServer = require('../../lib/utils/testServer');
const {authContext} = require('../../lib/context');
const TestLauncher = require('../../lib/testLauncher/SuitestLauncher');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');
const endpoints = require('../../lib/api/endpoints');
const config = require('../../config').config;
const {launcherLogger, snippets} = require('../../lib/testLauncher/launcherLogger');

describe('SuitestLauncher', () => {
	before(async() => {
		sinon.stub(process, 'exit');
		sinon.stub(launcherLogger, '_err');
		sinon.stub(launcherLogger, '_');
		sinon.stub(snippets, 'finalAutomated');
	});

	beforeEach(async() => {
		authContext.clear();
		await testServer.restart();
	});

	afterEach(() => {
		authContext.clear();
		nock.cleanAll();
	});

	after(async() => {
		await testServer.stop();
		process.exit.restore();
		launcherLogger._err.restore();
		launcherLogger._.restore();
		snippets.finalAutomated.restore();
	});

	it('should throw correct error on lack of arguments', async() => {
		const suitestLauncher = new TestLauncher();

		try {
			await suitestLauncher.runAutomatedSession();
			assert.ok(false, 'call runAutomatedSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(launcherLogger._err.called);
		}

		try {
			await suitestLauncher.runInteractiveSession();
			assert.ok(false, 'call runInteractiveSession success');
		} catch (error) {
			assert(process.exit.calledWith(1));
			assert(launcherLogger._err.called);
		}
	});

	it('should throw correct error on invalid json schema', async() => {
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
			assert(launcherLogger._err.called);
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
			assert(launcherLogger._err.called);
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
			assert(launcherLogger._err.called);
		}
	});

	it('should log successfull result for child process', async() => {
		const testNock = nock(config.apiUrl).post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}]))
			.reply(200, {
				deviceAccessToken: 'deviceAccessToken',
				testPack: {devices: [{deviceId: 'device1'}]},
			});
		const devicesDetailsNock = nock(config.apiUrl).get(makeUrlFromArray([endpoints.devices, null, {limit: 100}]))
			.reply(200, {
				values: [{deviceId: 'device1'}],
			});
		const sessionCloseNock = nock(config.apiUrl).post(endpoints.sessionClose).reply(200, {});
		const suitestLauncher = new TestLauncher({
			tokenKey: '1',
			tokenPassword: '1',
			testPackId: 10,
			concurrency: 1,
		}, ['npm', '--version']);

		await suitestLauncher.runAutomatedSession();

		assert.ok(testNock.isDone(), 'request');
		assert.ok(sessionCloseNock.isDone(), 'request');
		assert.ok(devicesDetailsNock.isDone(), 'request');
		assert.strictEqual(snippets.finalAutomated.called, true);
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
		assert(launcherLogger._err.called);
	});

	it('should exit runInteractiveSession if openSession fails', async() => {
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
		assert(launcherLogger._err.called);
	});

	it('should fun runInteractiveSession succesfully', async() => {
		const testNock = nock(config.apiUrl).post(endpoints.session).reply(200, {
			deviceAccessToken: 'deviceAccessToken',
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
		assert.ok(testNock.isDone(), 'request');
		assert.ok(sessionCloseNock.isDone(), 'request');
		assert(process.exit.calledWith(1));
		assert(launcherLogger._err.called);
	});
});
