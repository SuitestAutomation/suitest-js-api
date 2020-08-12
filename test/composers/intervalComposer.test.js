const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {intervalComposer} = require('../../lib/composers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Interval Composer', () => {
	it('should provide .interval method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, intervalComposer(suitest, data, chain, makeChain));

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

		Object.defineProperties(chain, intervalComposer(suitest, data, chain, makeChain));

		chain.interval(3000);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {interval: 3000});
	});

	it('should throw exception with invalid input', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, intervalComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.interval, [-3]);
		testInputErrorSync(chain.interval, [null]);
		testInputErrorSync(chain.interval, ['string']);
		testInputErrorSync(chain.interval, ['1']);
		testInputErrorSync(chain.interval, [{}]);
		testInputErrorSync(chain.interval, []);
	});
});
