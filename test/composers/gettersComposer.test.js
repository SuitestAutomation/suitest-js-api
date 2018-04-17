const assert = require('assert');
const sinon = require('sinon');
const {gettersComposer} = require('../../lib/composers');

describe('Getters Composer', () => {
	it('should provide .with, .it, .should and .times dummy props', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, gettersComposer(data, chain, makeChain));

		const withDescriptor = Object.getOwnPropertyDescriptor(chain, 'with');
		const itDescriptor = Object.getOwnPropertyDescriptor(chain, 'it');
		const shouldDescriptor = Object.getOwnPropertyDescriptor(chain, 'should');
		const timesDescriptor = Object.getOwnPropertyDescriptor(chain, 'times');

		assert.strictEqual(withDescriptor.enumerable, true);
		assert.strictEqual(withDescriptor.writable, false);
		assert.strictEqual(withDescriptor.configurable, false);

		assert.strictEqual(itDescriptor.enumerable, true);
		assert.strictEqual(itDescriptor.writable, false);
		assert.strictEqual(itDescriptor.configurable, false);

		assert.strictEqual(shouldDescriptor.enumerable, true);
		assert.strictEqual(shouldDescriptor.writable, false);
		assert.strictEqual(shouldDescriptor.configurable, false);

		assert.strictEqual(timesDescriptor.enumerable, true);
		assert.strictEqual(timesDescriptor.writable, false);
		assert.strictEqual(timesDescriptor.configurable, false);
	});

	it('should return reference to same object', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, gettersComposer(data, chain, makeChain));

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});
});
