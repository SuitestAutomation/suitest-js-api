const assert = require('assert');
const sinon = require('sinon');
const SuitestError = require('../../lib/utils/SuitestError');
const {intervalComposer} = require('../../lib/composers');
const testInputError = require('../../lib/utils/testHelpers/testInputError');

describe('Interval Composer', () => {
	it('should provide .interval method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, intervalComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.interval, 'function');

		const intervalDescriptor = Object.getOwnPropertyDescriptor(chain, 'interval');

		assert.strictEqual(intervalDescriptor.enumerable, true);
		assert.strictEqual(intervalDescriptor.writable, false);
		assert.strictEqual(intervalDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, intervalComposer(data, chain, makeChain));

		chain.interval(3000);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {interval: 3000});
	});

	it('should throw exception with invalid input', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, intervalComposer(data, chain, makeChain));

		await testInputError(chain.interval, [-3]);
		await testInputError(chain.interval, [null]);
		await testInputError(chain.interval, ['string']);
		await testInputError(chain.interval, ['1']);
		await testInputError(chain.interval, [{}]);
		await testInputError(chain.interval, []);
	});
});
