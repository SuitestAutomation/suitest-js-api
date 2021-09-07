const assert = require('assert');
const sinon = require('sinon');
const {v1: uuid} = require('uuid');

const testServer = require('../../lib/utils/testServer');
const webSockets = require('../../lib/api/webSockets');
const wsContentTypes = require('../../lib/api/wsContentTypes');
const SuitestApi = require('../../suitest');
const suitest = new SuitestApi();
const {pairedDeviceContext, authContext, appContext, testContext, logger} = suitest;
const sessionStarter = require('../../lib/utils/sessionStarter');
const bootstrapSession = (...args) => sessionStarter.bootstrapSession({...suitest, webSockets}, ...args);
const sessionConstants = require('../../lib/constants/session');
const nock = require('nock');
const stubDeviceInfoFeed = require('../../lib/utils/testHelpers/mockDeviceInfo');

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

	afterEach(() => {
		logger.error.restore();
		process.exit.restore();
	});

	it('should throw with invalid config in automated mode', async() => {
		await bootstrapSession(deviceId, {sessionType: 'automated'});
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
	});

	it('should throw with invalid config in interactive mode', async() => {
		await bootstrapSession(deviceId, {sessionType: 'interactive'});
		assert(process.exit.calledWith(1));
		assert(logger.error.called);
	});
});
