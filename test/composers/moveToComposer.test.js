const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {moveToComposer} = require('../../lib/composers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

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
		});
	});

	it('moveTo should accept arguments and correctly translate them', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, moveToComposer(suitest, data, chain, makeChain));

		chain.moveTo(10, 10);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isMoveTo: true,
			coordinates: {
				x: 10,
				y: 10,
			},
		});
	});
	it('moveTo should accept x and y with 0 value and negative values', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, moveToComposer(suitest, data, chain, makeChain));

		chain.moveTo(0, -10);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isMoveTo: true,
			coordinates: {
				x: 0,
				y: -10,
			},
		});
	});
	it('moveTo should be able to accept only 1 argument', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, moveToComposer(suitest, data, chain, makeChain));

		chain.moveTo(undefined, 0);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isMoveTo: true,
			coordinates: {
				y: 0,
			},
		});
	});
	it('moveTo should throw an error, if invalid argument was used', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, moveToComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.moveTo, [10, 'test']);
	});
	it('moveTo should throw an error, if one of arguments is empty string', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, moveToComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.moveTo, [10, '']);
	});
});
