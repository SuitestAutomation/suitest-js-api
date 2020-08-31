const assert = require('assert');
const sinon = require('sinon');
const {cloneComposer} = require('../../lib/composers');
const suitest = require('../../index');

describe('Clone composer', () => {
	it('should define clone method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, cloneComposer(suitest, data, chain, makeChain));

		const clonePropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'clone');

		assert.strictEqual(typeof chain.clone, 'function', 'is a Function');
		assert.strictEqual(clonePropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(clonePropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(clonePropertyDescriptor.writable, false, 'not writable');
	});

	it('should call provided clone method when defined property is called', () => {
		const data = {some: 'data'};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, cloneComposer(suitest, data, chain, makeChain));

		chain.clone();

		assert.deepStrictEqual(makeChain.firstCall.args[0], data);
	});
});
