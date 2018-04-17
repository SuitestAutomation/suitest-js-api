const assert = require('assert');
const sinon = require('sinon');
const {
	timeoutComposer,
} = require('../../lib/composers');

describe('Timeout Composer', () => {
	it('should provide .timeout method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, timeoutComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.timeout, 'function');

		const timeoutDescriptor = Object.getOwnPropertyDescriptor(chain, 'timeout');

		assert.strictEqual(timeoutDescriptor.enumerable, true);
		assert.strictEqual(timeoutDescriptor.writable, false);
		assert.strictEqual(timeoutDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, timeoutComposer(data, chain, makeChain));

		chain.timeout(3000);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {timeout: 3000});
	});
});
