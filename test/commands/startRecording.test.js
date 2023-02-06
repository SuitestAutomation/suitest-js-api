const assert = require('assert');
const testServer = require('../../lib/utils/testServer');
const sinon = require('sinon');
const suitest = require('../../index');

const sessionConstants = require('../../lib/constants/session');
const webSockets = require('../../lib/api/webSockets');
const {authContext, pairedDeviceContext, logger} = suitest;
const startRecording = () => require('../../lib/commands/startRecording')({...suitest, webSockets});
const SuitestError = require('../../lib/utils/SuitestError');

describe('startRecording', () => {
	before(async() => {
		sinon.stub(logger, 'log');
		sinon.stub(logger, 'delayed');
		await testServer.start();
		await webSockets.connect();
	});

	beforeEach(async() => {
		pairedDeviceContext.clear();
		authContext.clear();
	});

	after(async() => {
		logger.log.restore();
		logger.delayed.restore();
		await testServer.stop();
		pairedDeviceContext.clear();
		authContext.clear();
		webSockets.disconnect();
	});

	it('should not allow startRecording command in guest, access token contexts', async() => {
		try {
			await startRecording();
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
		authContext.setContext(sessionConstants.ACCESS_TOKEN, 'tokenId', 'tokenPass');
		try {
			await startRecording();
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
		}
	});

	it('should allow startRecording in "token" session context, clear device context', async() => {
		pairedDeviceContext.setContext('someContext');
		authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
		assert.strictEqual(pairedDeviceContext.context, 'someContext', 'device context set');
		try {
			await startRecording();
		} catch (error) {
			console.log('errorerror ', error)
			assert.ok(!error, 'error');
		}
	});

	it('should allow startRecording with webhookUrl', async() => {
		pairedDeviceContext.setContext('someContext');
		authContext.setContext(sessionConstants.TOKEN, 'tokenId', 'tokenPassword');
		assert.strictEqual(pairedDeviceContext.context, 'someContext', 'device context set');
		try {
			await startRecording({webhook: 'https://someUrl'});
		} catch (error) {
			assert.ok(!error, 'error');
		}
	});
});
