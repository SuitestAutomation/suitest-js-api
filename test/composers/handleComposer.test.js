const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {handleComposer} = require('../../lib/composers');

describe('handle composer', () => {
	it('should provide .handle method', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, handleComposer(suitest, data, chain, makeChain));

		const handleDescriptor = Object.getOwnPropertyDescriptor(chain, 'handle');

		assert.strictEqual(handleDescriptor.enumerable, true);
		assert.strictEqual(handleDescriptor.writable, false);
		assert.strictEqual(handleDescriptor.configurable, false);
	});

	it('should generate a new chain with defined handle property', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, handleComposer(suitest, data, chain, makeChain));

		chain.handle();
		assert.deepStrictEqual(makeChain.lastCall.args[0], {handle: {multiple: false}});

		chain.handle({});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {handle: {multiple: false}});

		chain.handle(true);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {handle: {multiple: true}});

		chain.handle({multiple: true});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {handle: {multiple: true}});

		chain.handle({multiple: false});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {handle: {multiple: false}});
	});

	it('should throw an error in case of invalid input', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, handleComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.handle, ['str'], {}, 'string is invalid input');
		testInputErrorSync(chain.handle, [1], {}, 'number is invalid input');
		testInputErrorSync(chain.handle, [null], {}, 'null is invalid input');
	});
});
