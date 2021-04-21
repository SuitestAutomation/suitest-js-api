const assert = require('assert');
const sinon = require('sinon');
const {closeComposer} = require('../../lib/composers');
const suitest = require('../../index');

describe('Close composer', () => {
	it('should define close method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, closeComposer(suitest, data, chain, makeChain));

		const closePropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'close');

		assert.strictEqual(typeof chain.close, 'function', 'is a Function');
		assert.strictEqual(closePropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(closePropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(closePropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isClosed flag when object converts to assert', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, closeComposer(suitest, data, chain, makeChain));

		chain.close();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isClosed: true});
	});
});
