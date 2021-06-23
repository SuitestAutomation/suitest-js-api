const assert = require('assert');
const sinon = require('sinon');
const {launchModeComposer} = require('../../lib/composers');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

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

	it('should generate correct chain', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, launchModeComposer(suitest, data, chain, makeChain));

		chain.launchMode('restart');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {launchMode: 'restart'});
	});

	it('should throw exception with invalid input', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, launchModeComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.launchMode, [-3]);
		testInputErrorSync(chain.launchMode, [null]);
		testInputErrorSync(chain.launchMode, ['string']);
		testInputErrorSync(chain.launchMode, ['1']);
		testInputErrorSync(chain.launchMode, [{}]);
		testInputErrorSync(chain.launchMode, []);
	});
});
