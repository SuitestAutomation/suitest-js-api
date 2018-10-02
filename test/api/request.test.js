const assert = require('assert');
const nock = require('nock');

const request = require('../../lib/api/request');
const SuitestError = require('../../lib/utils/SuitestError');

describe('request', () => {
	before(() => {
		nock.cleanAll();
		nock.disableNetConnect();
	});

	after(() => {
		nock.cleanAll();
		nock.enableNetConnect();
	});

	it('should handle 200 response', async() => {
		const testNock = nock(/.*/).get('/test').reply(200, {data: 'data'});
		let res;

		try {
			res = await request('/test', {method: 'GET'});
			assert.ok(testNock.isDone(), 'request');
			assert.ok(res, 'response');
			assert.equal(res.data, 'data', 'response data');
		} catch (error) {
			assert.ok(false, 'error');
		}
	});

	it('should handle non 200 response', async() => {
		const testNock = nock(/.*/).get('/test').reply(401, {});

		try {
			await request('/test', {method: 'GET'});
			assert.ok(false);
		} catch (error) {
			assert.ok(testNock.isDone(), 'request');
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.SERVER_ERROR, 'error code');
			assert.strictEqual(
				error.message,
				'Server error occurred while executing .request function. 401 - Unauthorized',
				'error message'
			);
		}
	});

	it('should send request with correct body', async() => {
		const testNock = nock(/.*/).post('/test', '{"data":"data"}').reply(200, {});
		let res;

		try {
			res = await request('/test', {
				method: 'POST',
				body: {data: 'data'},
			});

			assert.ok(testNock.isDone(), 'request');
			assert.ok(res, 'response');
		} catch (error) {
			assert.ok(false, 'error');
		}
	});

	it('should send request with correct Content-Type in headers', async() => {
		const testNock = nock(/.*/).post('/test').reply(200, {});

		const res = await request('/test', {
			method: 'POST',
			body: {
				data: 'data',
			},
			headers: {'Content-Type': 'application/json'},
		});

		assert.ok(testNock.isDone(), 'request');
		assert.ok(res, 'response');
	});
});
