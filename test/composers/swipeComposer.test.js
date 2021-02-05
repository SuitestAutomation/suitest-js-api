const assert = require('assert');
const sinon = require('sinon');
const {swipeComposer} = require('../../lib/composers');
const suitest = require('../../index');

describe('Swipe composer', () => {
	it('should define swipe/flick method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, swipeComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'swipe');

		assert.strictEqual(typeof chain.swipe, 'function', 'is a Function');
		assert.strictEqual(typeof chain.flick, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isSwipe flag when object converts to click', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, swipeComposer(suitest, data, chain, makeChain));

		chain.swipe('up', 1, 1, 1);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isSwipe: true, distance: 1, direction: 'up', duration: 1,
		});
	});
});
