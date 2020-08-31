const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const testServer = require('../../lib/utils/testServer');

const sessionConstants = require('../../lib/constants/session');
const webSockets = require('../../lib/api/webSockets');
const {authContext, testContext, logger} = suitest;
const startTest = (...args) => require('../../lib/commands/startTest')({...suitest, webSockets}, ...args);
const SuitestError = require('../../lib/utils/SuitestError');

describe('startTest', () => {
	before(async() => {
		sinon.stub(logger, 'info');
		sinon.stub(logger, 'delayed');
		await testServer.start();
	});

	beforeEach(() => {
		testContext.clear();
		authContext.clear();
	});

	after(async() => {
		logger.info.restore();
		logger.delayed.restore();
		await testServer.stop();
		testContext.clear();
		authContext.clear();
		webSockets.disconnect();
	});

	it('should not allow startTest command in guest, access token contexts', async() => {
		try {
			await startTest('clientTestId');
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		try {
			await startTest('clientTestId');
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow startTest in automated session context, set correct test context', async() => {
		const newTest = {
			clientTestId: 'clientTestId',
			name: 'name',
			description: 'description',
		};

		authContext.setContext(sessionConstants.AUTOMATED, 'tokenId');

		const authedWsConnect = await authContext.authorizeWsConnection({});

		await webSockets.connect(authedWsConnect);

		try {
			const res = await startTest(newTest.clientTestId, newTest);

			assert.ok(!res, 'response void');
			assert.deepEqual(newTest, testContext.context, 'testContext');
		} catch (error) {
			assert.ok(!error, 'error');
		}

		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');

		try {
			const res = await startTest(newTest.clientTestId, newTest);

			assert.ok(!res, 'response void');
			assert.deepEqual(newTest, testContext.context, 'testContext');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});
});
