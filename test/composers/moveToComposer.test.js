const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {moveToComposer} = require('../../lib/composers');

describe('Move To composer', () => {
	it('should define moveTo method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, moveToComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'moveTo');

		assert.strictEqual(typeof chain.moveTo, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isMoveTo flag when object converts to moveTo', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, moveToComposer(suitest, data, chain, makeChain));

		chain.moveTo();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isMoveTo: true,
			coordinates: {
				x: undefined,
				y: undefined,
			},
		});
	});
});
