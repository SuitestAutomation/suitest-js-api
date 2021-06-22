const assert = require('assert');
const sinon = require('sinon');
const {launchModeComposer} = require('../../lib/composers');
const suitest = require('../../index');

describe('Launch Mode composer', () => {
	it('should define Launch Mode method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, launchModeComposer(suitest, data, chain, makeChain));

		const launchModePropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'launchMode');

		assert.strictEqual(typeof chain.launchMode, 'function', 'is a Function');
		assert.strictEqual(launchModePropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(launchModePropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(launchModePropertyDescriptor.writable, false, 'not writable');
	});

	it('should set closeApp flag when object converts to assert', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, launchModeComposer(suitest, data, chain, makeChain));

		chain.launchMode('restart');

		console.log('makeChain.firstCall ', makeChain.firstCall)

		assert.deepStrictEqual(makeChain.firstCall.args[0], {launchMode: 'restart'});
	});
});
