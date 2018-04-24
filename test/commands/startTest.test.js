const assert = require('assert');
const testServer = require('../../lib/utils/testServer');

const sessionConstants = require('../../lib/constants/session');
const {authContext, testContext} = require('../../lib/context');
const startTest = require('../../lib/commands/startTest');
const SuitestError = require('../../lib/utils/SuitestError');
const webSockets = require('../../lib/api/webSockets');
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');

describe('startTest', () => {
	before(async() => {
		await testServer.start();
	});

	beforeEach(() => {
		testContext.clear();
		authContext.clear();
	});

	after(async() => {
		await testServer.stop();
		testContext.clear();
		authContext.clear();
		webSockets.disconnect();
	});

	it('should not allow startTest with invalid input', async() => {
		await testInputErrorAsync(startTest, [1, {}]);
	});

	it('should not allow startTest command in guest, access token contexts', async() => {
		try {
			await startTest('testName', {});
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		try {
			await startTest('testName', {});
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow startTest in automated session context, set correct test context', async() => {
		const newTest = {
			name: 'testName',
			clientTestId: 'clientTestId',
		};

		authContext.setContext(sessionConstants.AUTOMATED, 'tokenId');

		const authedWsConnect = await authContext.authorizeWsConnection({});

		await webSockets.connect(authedWsConnect);

		try {
			const res = await startTest(newTest.name, {clientTestId: newTest.clientTestId});

			assert.ok(!res, 'response void');
			assert.deepEqual(newTest, testContext.context, 'response void');
		} catch (error) {
			assert.ok(!error, 'error');
		}

		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');

		try {
			const res = await startTest(newTest.name, {clientTestId: newTest.clientTestId});

			assert.ok(!res, 'response void');
			assert.deepEqual(newTest, testContext.context, 'response void');
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});

	it('Exception should be thrown in guest session context', async() => {
		authContext.setContext(sessionConstants.GUEST, 'tokenId');

		try {
			await authContext.authorizeWsConnection({});
			assert.ok(false, 'Exception should be thrown');
		} catch (e) {
			assert.ok(true, 'error');
		}
	});
});
