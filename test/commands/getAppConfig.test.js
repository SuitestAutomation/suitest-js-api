const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');

const testServer = require('../../lib/utils/testServer');

const {appContext, authContext, logger} = suitest;
const webSockets = require('../../lib/api/webSockets');
const getAppConfig = (...args) =>
	require('../../lib/commands/getAppConfig').getAppConfig({...suitest, webSockets}, ...args);
const sessionConstants = require('../../lib/constants/session');
const mockWebSocket = require('../../lib/utils/testHelpers/mockWebSocket');

describe('getAppConfig', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'json');
		sinon.stub(logger, 'delayed');
		await testServer.start();
		await webSockets.connect();
	});
	beforeEach(() => {
		appContext.clear();
		authContext.clear();
	});
	after(async() => {
		logger.log.restore();
		logger.json.restore();
		logger.delayed.restore();
		await testServer.stop();
		webSockets.disconnect();
		appContext.clear();
		authContext.clear();
	});
	afterEach(() => {
		mockWebSocket.restoreResponse();
	});

	it('should return undefined if error occured', async() => {
		try {
			mockWebSocket.mockResponse({result: 'error'});
			authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
			appContext.setContext(true);
			await getAppConfig();
		} catch (error) {
			assert.ok(error, 'error');
		}
	});

	it('should get correct app config', async() => {
		mockWebSocket.mockResponse(
			{
				result: 'success',
				configuration: {
					name: 'name',
					url: 'name',
					suitestify: true,
					domainList: [],
					variables: {},
				},
			},
		);
		authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
		appContext.setContext(true);

		const result = await getAppConfig();

		assert.deepStrictEqual(result, {
			name: 'name',
			url: 'name',
			suitestify: true,
			domainList: [],
			variables: {},
		});
	});
});
