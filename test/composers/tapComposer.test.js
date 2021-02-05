const assert = require('assert');
const sinon = require('sinon');
const {tapComposer} = require('../../lib/composers');
const suitest = require('../../index');

describe('Tap composer', () => {
	it('should define tap method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, tapComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'tap');

		assert.strictEqual(typeof chain.tap, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set tap property when object converts to click', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, tapComposer(suitest, data, chain, makeChain));

		chain.tap('single');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {tap: 'single'});
	});
});
