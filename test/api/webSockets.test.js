const assert = require('assert');
const testServer = require('../../lib/utils/testServer');
const webSockets = require('../../lib/api/webSockets');
const SuitestError = require('../../lib/utils/SuitestError');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');

describe('webSockets', () => {
	beforeEach(async() => {
		await testServer.restart();
	});

	after(async() => {
		await testServer.stop();
	});

	it('should connect to and disconnect from server', async() => {
		await webSockets.connect();
		assert.strictEqual(webSockets.isConnected(), true, 'connected');
		webSockets.disconnect();
		assert.strictEqual(webSockets.isConnected(), false, 'connected');
	});

	it('should send message and receive success response', async() => {
		await webSockets.connect();
		const res = await webSockets.send({test: 'test'});

		webSockets.disconnect();

		assert.ok(res, 'response');
		assert.equal(res.result, 'success', 'content');
	});

	it('should process chain requests correctly', async() => {
		await webSockets.connect();
		const res = await webSockets.send({type: 'query'});

		webSockets.disconnect();

		assert.ok(res, 'response');
		assert.equal(res.result, 'success', 'content');
		assert.equal(res.contentType, 'query', 'contentType');
	});

	it('should send message and receive fail response', async() => {
		let err;

		await webSockets.connect();
		try {
			testServer.respondWithSuccess(false);
			await webSockets.send({test: 'test'});
		} catch (error) {
			err = error;
		} finally {
			webSockets.disconnect();
		}

		assert.ok(err, 'error');
		assert.strictEqual(err.code, SuitestError.WS_ERROR, 'error code');
	});

	it('should throw error when send is called but ws is not connected', async() => {
		let err;

		try {
			await webSockets.send({test: 'test'});
		} catch (error) {
			err = error;
		}

		assert.ok(err, 'error');
		assert.strictEqual(err.code, SuitestError.WS_ERROR, 'error code');
		assert.strictEqual(webSockets.isConnected(), false, 'connected');
	});

	it('should reject connection promise if server was disconnected unexpectedly', async() => {
		let err;

		await testServer.stop();

		try {
			await webSockets.connect();
		} catch (error) {
			err = error;
		}

		assert.ok(err);
		assert.strictEqual(webSockets.isConnected(), false, 'connected');
	});

	it('should handle ws response without error message', async() => {
		await webSockets.connect();

		testServer.respondWithContent({
			result: 'fail',
			error: 'something went wrong',
		});

		await assertThrowsAsync(
			webSockets.send.bind(webSockets, {test: 'test'}),
			err => err instanceof SuitestError &&
				err.code === SuitestError.WS_ERROR &&
				err.message.endsWith('something went wrong.'),
		);

		testServer.respondWithContent(undefined);
	});
});
