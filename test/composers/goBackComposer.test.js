const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {goBackComposer} = require('../../lib/composers');

describe('Go Back composer', () => {
	it('should define goBack method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, goBackComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'goBack');

		assert.strictEqual(typeof chain.goBack, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isgoBack flag when object converts to goBack', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, goBackComposer(suitest, data, chain, makeChain));

		chain.goBack();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isGoBack: true});
	});
});
