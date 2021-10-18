const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const suitest = require('../../index');
const testServer = require('../../lib/utils/testServer');
const webSockets = require('../../lib/api/webSockets');
const {authContext, logger} = suitest;
const openSession = (...arg) => require('../../lib/commands/openSession').openSession({...suitest, webSockets}, ...arg);
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');

describe('openSession', () => {
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
		nock.cleanAll();
		authContext.clear();
		await testServer.stop();
	});

	it('should throw correct error on invalid input', async() => {
		await testInputErrorAsync(openSession, [{invalid: true}]);
	});

	it('should open session when tokenId and tokenPassword provided', async() => {
		const response = await openSession({tokenId: 'tokenId', tokenPassword: 'tokenPassword'});

		assert.deepStrictEqual(response, {accessToken: 'tokenId:tokenPassword'});
	});
});
