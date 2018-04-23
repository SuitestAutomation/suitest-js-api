const assert = require('assert');
const sinon = require('sinon');
const SuitestError = require('../../lib/utils/SuitestError');
const {repeatComposer} = require('../../lib/composers');
const testInputError = require('../../lib/utils/testHelpers/testInputError');

describe('Repeat Composer', () => {
	it('should provide .repeat method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, repeatComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.repeat, 'function');

		const repeatDescriptor = Object.getOwnPropertyDescriptor(chain, 'repeat');

		assert.strictEqual(repeatDescriptor.enumerable, true);
		assert.strictEqual(repeatDescriptor.writable, false);
		assert.strictEqual(repeatDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, repeatComposer(data, chain, makeChain));

		chain.repeat(10);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {repeat: 10});
	});

	it('should throw exception with invalid input', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, repeatComposer(data, chain, makeChain));

		await testInputError(chain.repeat, [-3]);
		await testInputError(chain.repeat, [null]);
		await testInputError(chain.repeat, ['string']);
		await testInputError(chain.repeat, ['1']);
		await testInputError(chain.repeat, [{}]);
		await testInputError(chain.repeat, []);
	});
});
