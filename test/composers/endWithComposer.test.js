const assert = require('assert');
const sinon = require('sinon');
const {endWithComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('End With Composer', () => {
	it('should provide .endWith and .endsWith methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, endWithComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');

		const endWithDescriptor = Object.getOwnPropertyDescriptor(chain, 'endWith');
		const endsWithDescriptor = Object.getOwnPropertyDescriptor(chain, 'endsWith');

		assert.strictEqual(endWithDescriptor.enumerable, true);
		assert.strictEqual(endWithDescriptor.writable, false);
		assert.strictEqual(endWithDescriptor.configurable, false);

		assert.strictEqual(endsWithDescriptor.enumerable, true);
		assert.strictEqual(endsWithDescriptor.writable, false);
		assert.strictEqual(endsWithDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, endWithComposer(data, chain, makeChain));

		chain.endsWith('test');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.END_WITH,
				val: 'test',
			},
		});
	});

	it('throw error if value is invalid', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, endWithComposer(data, chain, makeChain));

		testInputErrorSync(chain.endsWith, [1]);
		testInputErrorSync(chain.endsWith, []);
		testInputErrorSync(chain.endsWith, [null]);
	});
});
