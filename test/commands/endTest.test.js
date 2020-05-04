const assert = require('assert');
const testServer = require('../../lib/utils/testServer');
const sinon = require('sinon');

const sessionConstants = require('../../lib/constants/session');
const {authContext} = require('../../lib/context');
const endTest = require('../../lib/commands/endTest');
const SuitestError = require('../../lib/utils/SuitestError');
const webSockets = require('../../lib/api/webSockets');
const logger = require('../../lib/utils/logger');

describe('endTest', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'delayed');
		await testServer.start();
	});

	beforeEach(() => {
		authContext.clear();
	});

	after(async() => {
		logger.log.restore();
		logger.delayed.restore();
		await testServer.stop();
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
		} catch (error) {
			assert.ok(!error, 'error');
		}

		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');

		try {
			res = await endTest();
			assert.ok(!res, 'response void');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});
});
