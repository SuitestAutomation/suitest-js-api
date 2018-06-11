const assert = require('assert');
const sinon = require('sinon');
const {notComposer} = require('../../lib/composers');

describe('Not Composer', () => {
	it('should provide .not and .doesNot and .isNot methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, notComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');

		const notDescriptor = Object.getOwnPropertyDescriptor(chain, 'not');
		const doesNotDescriptor = Object.getOwnPropertyDescriptor(chain, 'doesNot');
		const isNotDescriptor = Object.getOwnPropertyDescriptor(chain, 'isNot');

		assert.strictEqual(notDescriptor.enumerable, true);
		assert.strictEqual(notDescriptor.writable, false);
		assert.strictEqual(notDescriptor.configurable, false);

		assert.strictEqual(doesNotDescriptor.enumerable, true);
		assert.strictEqual(doesNotDescriptor.writable, false);
		assert.strictEqual(doesNotDescriptor.configurable, false);

		assert.strictEqual(isNotDescriptor.enumerable, true);
		assert.strictEqual(isNotDescriptor.writable, false);
		assert.strictEqual(isNotDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, notComposer(data, chain, makeChain));

		chain.not();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isNegated: true});
	});
});
