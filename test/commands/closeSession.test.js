const assert = require('assert');
const nock = require('nock');

const {authContext, appContext} = require('../../lib/context');
const sessionConstants = require('../../lib/constants/session');
const closeSession = require('../../lib/commands/closeSession');
const endpoints = require('../../lib/api/endpoints');
const SuitestError = require('../../lib/utils/SuitestError');
const envVars = require('../../lib/constants/enviroment');

describe('closeSession', () => {
	before(() => {
		nock.disableNetConnect();
	});

	beforeEach(() => {
		authContext.clear();
	});

	after(() => {
		nock.cleanAll();
		nock.enableNetConnect();
		authContext.clear();
		appContext.clear();
	});

	it('should not authorize close session action for guest context', async() => {
		try {
			await closeSession();
			assert.ok(false, 'close session success');
		} catch (error) {
			assert.ok(error, 'close session error');
			assert.equal(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error type');
		}
	});

	it('should not authorize close session action for access token context', async() => {
		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');

		try {
			await closeSession();
			assert.ok(false, 'close session success');
		} catch (error) {
			assert.ok(error, 'close session error');
			assert.equal(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error type');
		}
	});

	it('should close session for automated session context', async() => {
		authContext.setContext(sessionConstants.AUTOMATED, 'tokenId');
		appContext.setContext(true);
		const testNock = nock(/.*/).post(endpoints.sessionClose).reply(200, {});
		let res;

		try {
			res = await closeSession();
			assert.ok(testNock.isDone(), 'close session request');
			assert.strictEqual(res, undefined, 'resolved with void');
			assert.equal(authContext.context, sessionConstants.GUEST, 'guest context set');
			assert.strictEqual(appContext.context, null, 'app context cleared');
		} catch (error) {
			assert.ok(false, 'close session error');
		}
	});

	it('should close session for interactive session context', async() => {
		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');
		const testNock = nock(/.*/).post(endpoints.sessionClose).reply(200, {});
		let res;

		try {
			res = await closeSession();
			assert.ok(testNock.isDone(), 'close session request');
			assert.strictEqual(res, undefined, 'resolved with void');
			assert.equal(authContext.context, sessionConstants.GUEST, 'guest context set');
		} catch (error) {
			assert.ok(false, 'close session error');
		}
	});

	it('should throw correct error on network error', async() => {
		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');
		const testNock = nock(/.*/).post(endpoints.sessionClose).replyWithError({'code': 'ENOTFOUND'});

		try {
			await closeSession();
			assert.ok(false, 'close session success');
		} catch (error) {
			assert.ok(testNock.isDone(), 'close session response');
			assert.ok(error, 'close session error');
			assert.equal(error.code, 'ENOTFOUND', 'close session error code');
		}
	});

	it('should throw correct error on server response error', async() => {
		authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');
		const testNock = nock(/.*/).post(endpoints.sessionClose).reply(401);

		try {
			await closeSession();
			assert.ok(false, 'close session success');
		} catch (error) {
			assert.ok(testNock.isDone(), 'close session request');
			assert.ok(error, 'close session error');
			assert.equal(error.code, SuitestError.SERVER_ERROR, 'close session error code');
		}
	});

	// it('should not call http request to invalidate tokens in test launcher child process', async() => {
	// 	process.env[envVars.SUITEST_LAUNCHER_PROCESS] = true;
	// 	authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId');
	// 	const testNock = nock(/.*/).post(endpoints.sessionClose).reply(200);

	// 	await closeSession();
	// 	assert.strictEqual(testNock.isDone(), false, 'close session request not sent');
	// 	assert.ok(error, 'close session error');

	// 	delete process.env[envVars.SUITEST_LAUNCHER_PROCESS];
	// });
});
