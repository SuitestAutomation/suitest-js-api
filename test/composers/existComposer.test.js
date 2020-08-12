const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {existComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');

describe('Exist Composer', () => {
	it('should provide .exist and .exists methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, existComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.exist, 'function');
		assert.strictEqual(typeof chain.exists, 'function');

		const existDescriptor = Object.getOwnPropertyDescriptor(chain, 'exist');
		const existsDescriptor = Object.getOwnPropertyDescriptor(chain, 'exists');

		assert.strictEqual(existDescriptor.enumerable, true);
		assert.strictEqual(existDescriptor.writable, false);
		assert.strictEqual(existDescriptor.configurable, false);

		assert.strictEqual(existsDescriptor.enumerable, true);
		assert.strictEqual(existsDescriptor.writable, false);
		assert.strictEqual(existsDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, existComposer(suitest, data, chain, makeChain));

		chain.exists();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {comparator: {type: SUBJ_COMPARATOR.EXIST}});
	});
});
