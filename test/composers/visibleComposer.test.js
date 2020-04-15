const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {visibleComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');

describe('Visible Composer', () => {
	it('should provide .visible', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, visibleComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.visible, 'function');

		const visibleDescriptor = Object.getOwnPropertyDescriptor(chain, 'visible');

		assert.strictEqual(visibleDescriptor.enumerable, true);
		assert.strictEqual(visibleDescriptor.writable, false);
		assert.strictEqual(visibleDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, visibleComposer(suitest, data, chain, makeChain));

		chain.visible();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {comparator: {type: SUBJ_COMPARATOR.VISIBLE}});
	});
});
