const assert = require('assert');
const chainPromise = require('../../lib/utils/chainPromise');
const sinon = require('sinon');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');

describe('chainPromise method', () => {
	it('should accept callback and return promise', () => {
		const callback = sinon.spy();
		const func = chainPromise(callback);
		const pr = func();

		assert.ok(typeof func === 'function');
		assert.ok(pr instanceof Promise);
	});

	it('should chain promises, regardless of their resolve state, and return correct values', async() => {
		const callback1 = sinon.spy(() => new Promise((res, rej) => setTimeout(() => rej(new Error('1 promise')), 10)));
		const callback2 = sinon.spy(() => new Promise(res => setTimeout(() => res('2 promise'), 5)));
		const callback3 = sinon.spy(() => new Promise(res => res('3 promise')));

		const promise1 = chainPromise(callback1)();
		const promise2 = chainPromise(callback2)();
		const promise3 = chainPromise(callback3)();

		// Inverse order is intentional
		assert.strictEqual(await promise3, '3 promise');
		assert.strictEqual(await promise2, '2 promise');
		assertThrowsAsync(async() => await promise1, /1 promise/);

		assert.ok(callback1.calledBefore(callback2));
		assert.ok(callback2.calledBefore(callback3));
	});
});
