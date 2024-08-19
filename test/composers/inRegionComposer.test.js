const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {inRegionComposer} = require('../../lib/composers');
const {suitestInvalidInputError} = require('../../lib/utils/testHelpers/testInputError');

describe('InRegion Composer', () => {
	it('should provide .inRegion', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, inRegionComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.inRegion, 'function');

		const visibleDescriptor = Object.getOwnPropertyDescriptor(chain, 'inRegion');

		assert.strictEqual(visibleDescriptor.enumerable, true);
		assert.strictEqual(visibleDescriptor.writable, false);
		assert.strictEqual(visibleDescriptor.configurable, false);
	});

	it('should set region to internal chain data', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, inRegionComposer(suitest, data, chain, makeChain));

		chain.inRegion([20, 20, 20, 20]);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {region: [20, 20, 20, 20]});
	});

	describe('should throw error when inRegion called with wrong arguments', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, inRegionComposer(suitest, data, chain, makeChain));

		it('Region should be array', () => {
			const shouldBeArrayError =
				suitestInvalidInputError('Invalid input provided for .region function. Region should be array');

			assert.throws(() => chain.inRegion(), shouldBeArrayError);
			assert.throws(() => chain.inRegion(null), shouldBeArrayError);
			assert.throws(() => chain.inRegion(12), shouldBeArrayError);
			assert.throws(() => chain.inRegion({}), shouldBeArrayError);
			assert.throws(() => chain.inRegion('region'), shouldBeArrayError);
			assert.throws(() => chain.inRegion(false), shouldBeArrayError);
		});

		it('Region should be tuple of four numbers', () => {
			assert.throws(
				() => chain.inRegion([10]),
				suitestInvalidInputError('Invalid input provided for .region function. Region should NOT have fewer than 4 items'),
			);
			assert.throws(
				() => chain.inRegion([10, 10, 10, 10, 10]),
				suitestInvalidInputError('Invalid input provided for .region function. Region should NOT have more than 4 items'),
			);

			assert.throws(
				() => chain.inRegion(['10', 10, 10, 10]),
				suitestInvalidInputError('Invalid input provided for .region function. Region [0] should be number'),
			);
			assert.throws(
				() => chain.inRegion([10, '10', 10, 10]),
				suitestInvalidInputError('Invalid input provided for .region function. Region [1] should be number'),
			);
			assert.throws(
				() => chain.inRegion([10, 10, '10', 10]),
				suitestInvalidInputError('Invalid input provided for .region function. Region [2] should be number'),
			);
			assert.throws(
				() => chain.inRegion([10, 10, 10, '10']),
				suitestInvalidInputError('Invalid input provided for .region function. Region [3] should be number'),
			);
		});
	});
});
