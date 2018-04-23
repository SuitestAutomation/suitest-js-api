const assert = require('assert');
const sinon = require('sinon');
const {containComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Contain Composer', () => {
	it('should provide .contain and .contains methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, containComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');

		const containDescriptor = Object.getOwnPropertyDescriptor(chain, 'contain');
		const containsDescriptor = Object.getOwnPropertyDescriptor(chain, 'contains');

		assert.strictEqual(containDescriptor.enumerable, true);
		assert.strictEqual(containDescriptor.writable, false);
		assert.strictEqual(containDescriptor.configurable, false);

		assert.strictEqual(containsDescriptor.enumerable, true);
		assert.strictEqual(containsDescriptor.writable, false);
		assert.strictEqual(containsDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, containComposer(data, chain, makeChain));

		chain.contains('test');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.CONTAIN,
				val: 'test',
			},
		});
	});

	it('throw error if value is invalid', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, containComposer(data, chain, makeChain));

		testInputErrorSync(chain.contain, [1]);
		testInputErrorSync(chain.contain, []);
		testInputErrorSync(chain.contain, [null]);
	});
});
