const assert = require('assert');
const testServer = require('../../lib/utils/testServer');
const sinon = require('sinon');
const suitest = require('../../index');

const sessionConstants = require('../../lib/constants/session');
const {authContext, testContext, logger} = suitest;
const webSockets = require('../../lib/api/webSockets');
const endTest = () => require('../../lib/commands/endTest')({...suitest, webSockets});
const SuitestError = require('../../lib/utils/SuitestError');

describe('endTest', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'delayed');
		await testServer.start();
	});

	beforeEach(() => {
		testContext.clear();
		authContext.clear();
	});

	after(async() => {
		logger.log.restore();
		logger.delayed.restore();
		await testServer.stop();
		testContext.clear();
		authContext.clear();
		webSockets.disconnect();
	});

	it('should not allow endTest command in guest, access token contexts', async() => {
		try {
			await endTest('testName', {});
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		try {
			await endTest('testName', {});
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow endTest in automated session context, set correct test context', async() => {
		authContext.setContext(sessionConstants.AUTOMATED, 'tokenId');
		await webSockets.connect();

		let res;

		try {
			res = await endTest();
			assert.ok(!res, 'response void');
			assert.ok(!testContext.context, 'response void');
		} catch (error) {
			assert.ok(!error, 'error');
		}

		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');

		try {
			res = await endTest();
			assert.ok(!res, 'response void');
			assert.ok(!testContext.context, 'response void');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});
});
