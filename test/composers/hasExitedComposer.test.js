const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {hasExitedComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');

describe('Has Exited Composer', () => {
	it('should provide .hasExited method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, hasExitedComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.hasExited, 'function');

		const hasExitedDescriptor = Object.getOwnPropertyDescriptor(chain, 'hasExited');

		assert.strictEqual(hasExitedDescriptor.enumerable, true);
		assert.strictEqual(hasExitedDescriptor.writable, false);
		assert.strictEqual(hasExitedDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, hasExitedComposer(suitest, data, chain, makeChain));

		chain.hasExited();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {comparator: {type: SUBJ_COMPARATOR.HAS_EXITED}});
	});
});
