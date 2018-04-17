const assert = require('assert');
const sinon = require('sinon');
const {abandonComposer} = require('../../lib/composers');

describe('Abandon composer', () => {
	it('should define abandon method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, abandonComposer(data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'abandon');

		assert.strictEqual(typeof chain.abandon, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set abandoned flag when object gets abandoned', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, abandonComposer(data, chain, makeChain));

		chain.abandon();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isAbandoned: true});
	});
});
