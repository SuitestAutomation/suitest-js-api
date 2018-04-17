const assert = require('assert');
const sinon = require('sinon');
const {assertComposer} = require('../../lib/composers');

describe('Assert composer', () => {
	it('should define toAssert method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, assertComposer(data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'toAssert');

		assert.strictEqual(typeof chain.toAssert, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isAssert flag when object converts to assert', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, assertComposer(data, chain, makeChain));

		chain.toAssert();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isAssert: true});
	});
});
