const assert = require('assert');
const Queue = require('../../lib/utils/Queue');

describe('Queue', function() {
	this.timeout(5000); // increase timeout limit for current test suite

	it('should push functions and execute it on start call with provided concurrency', (done) => {
		const concurrency = 3;
		const queue = new Queue(concurrency);
		const obj = {};
		const func = (timeout, num, obj, reject) => {
			return new Promise((res, rej) => {
				setTimeout(() => {
					obj[''+ num] = Date.now();
					reject ? rej() : res();
				}, timeout);
			});
		};

		for (let i = 0; i < 4; i++) {
			queue.push(func.bind(this, i === 3 ? 1 : 300 * i, i, obj, i === 0));
		}

		queue.start().then(result => {
			assert.ok('error' in result[0], 'first promise should be rejected');
			assert.equal(result.length, 4, 'all functions finished');
			assert.ok(obj['0'] < obj['3'], 'last should finished latter then 1');
			assert.ok(obj['1'] > obj['3'], '2 should finished latter then last');
			done();
		});
	});
});
