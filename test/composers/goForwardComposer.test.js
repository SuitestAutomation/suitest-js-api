const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {goForwardComposer} = require('../../lib/composers');

describe('Go Forward composer', () => {
	it('should define goForward method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, goForwardComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'goForward');

		assert.strictEqual(typeof chain.goForward, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isGoForward flag when object converts to goForward', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, goForwardComposer(suitest, data, chain, makeChain));

		chain.goForward();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isGoForward: true});
	});
});
