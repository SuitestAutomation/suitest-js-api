const assert = require('assert');
const sinon = require('sinon');
const SuitestError = require('../../lib/utils/SuitestError');
const {repeatComposer} = require('../../lib/composers');

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

	it('should throw exception with invalid input', () => {
		const assertInputValidate = val => assert.throws(
			() => chain.repeat(val),
			err => err instanceof SuitestError && err.code === SuitestError.INVALID_INPUT
		);
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, repeatComposer(data, chain, makeChain));

		assertInputValidate(-3);
		assertInputValidate(null);
		assertInputValidate('string');
		assertInputValidate('1');
		assertInputValidate({});
		assertInputValidate();
	});
});
