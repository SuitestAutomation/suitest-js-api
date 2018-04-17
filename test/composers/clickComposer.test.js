const assert = require('assert');
const sinon = require('sinon');
const {clickComposer} = require('../../lib/composers');

describe('Click composer', () => {
	it('should define click method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, clickComposer(data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'click');

		assert.strictEqual(typeof chain.click, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isClick flag when object converts to click', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, clickComposer(data, chain, makeChain));

		chain.click();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isClick: true});
	});
});
