const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const suitest = require('../../index');
const sessionConstants = require('../../lib/constants/session');
const {authContext, appContext, closeSession, logger} = suitest;

describe('closeSession', () => {
	before(() => {
		nock.disableNetConnect();
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'delayed');
	});

	beforeEach(() => {
		authContext.clear();
	});

	after(() => {
		logger.log.restore();
		logger.delayed.restore();
		nock.cleanAll();
		nock.enableNetConnect();
		authContext.clear();
		appContext.clear();
	});

	it('should close session for token session context', async() => {
		authContext.setContext(sessionConstants.TOKEN, 'tokenId');
		appContext.setContext(true);

		try {
			const res = await closeSession();

			assert.strictEqual(res, undefined, 'resolved with void');
			assert.equal(authContext.context, sessionConstants.GUEST, 'guest context set');
			assert.strictEqual(appContext.context, null, 'app context cleared');
		} catch (error) {
			assert.ok(false, 'close session error');
		}
	});
});
