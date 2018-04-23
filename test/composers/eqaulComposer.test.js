const assert = require('assert');
const sinon = require('sinon');
const {equalComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Equal Composer', () => {
	it('should provide .equal and .equals methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, equalComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');

		const equalDescriptor = Object.getOwnPropertyDescriptor(chain, 'equal');
		const equalsDescriptor = Object.getOwnPropertyDescriptor(chain, 'equals');

		assert.strictEqual(equalDescriptor.enumerable, true);
		assert.strictEqual(equalDescriptor.writable, false);
		assert.strictEqual(equalDescriptor.configurable, false);

		assert.strictEqual(equalsDescriptor.enumerable, true);
		assert.strictEqual(equalsDescriptor.writable, false);
		assert.strictEqual(equalsDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, equalComposer(data, chain, makeChain));

		chain.equals('test');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				val: 'test',
			},
		});
	});

	it('throw error if value is invalid', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, equalComposer(data, chain, makeChain));

		testInputErrorSync(chain.equals, [1]);
		testInputErrorSync(chain.equals, []);
		testInputErrorSync(chain.equals, [null]);
	});
});
