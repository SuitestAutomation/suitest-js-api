const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {refreshComposer} = require('../../lib/composers');

describe('Refresh composer', () => {
	it('should define refresh method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, refreshComposer(suitest, data, chain, makeChain));

		const refreshPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'refresh');

		assert.strictEqual(typeof chain.refresh, 'function', 'is a Function');
		assert.strictEqual(refreshPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(refreshPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(refreshPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isRefresh flag when object converts to refresh', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, refreshComposer(suitest, data, chain, makeChain));

		chain.refresh();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isRefresh: true});
	});
});
