const assert = require('assert');
const sinon = require('sinon');
const {scrollComposer} = require('../../lib/composers');
const suitest = require('../../index');

describe('Scroll composer', () => {
	it('should define scroll method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, scrollComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'scroll');

		assert.strictEqual(typeof chain.scroll, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isScroll flag when object converts to click', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, scrollComposer(suitest, data, chain, makeChain));

		chain.scroll('top', 1, 1);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isScroll: true, distance: 1, direction: 'top'});
	});
});
