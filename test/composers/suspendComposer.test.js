const assert = require('assert');
const sinon = require('sinon');
const {suspendComposer} = require('../../lib/composers');
const suitest = require('../../index');

describe('Suspend composer', () => {
	it('should define suspend method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, suspendComposer(suitest, data, chain, makeChain));

		const suspendPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'suspend');

		assert.strictEqual(typeof chain.suspend, 'function', 'is a Function');
		assert.strictEqual(suspendPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(suspendPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(suspendPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set suspendApp flag when object converts to assert', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, suspendComposer(suitest, data, chain, makeChain));

		chain.suspend();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {suspendApp: true});
	});
});
