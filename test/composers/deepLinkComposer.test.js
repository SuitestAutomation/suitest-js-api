const assert = require('assert');
const sinon = require('sinon');
const {deepLinkComposer} = require('../../lib/composers');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Deep link composer', () => {
	const createChain = (data = {}) => {
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, deepLinkComposer(suitest, data, chain, makeChain));

		return {chain, makeChain};
	};

	it('should define deepLink method', () => {
		const {chain} = createChain();
		const deepLinkPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'deepLink');

		assert.strictEqual(typeof chain.deepLink, 'function', 'deepLink should be a function');
		assert.strictEqual(deepLinkPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(deepLinkPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(deepLinkPropertyDescriptor.writable, false, 'not writable');
	});

	it('should generate correct chain', () => {
		const {chain, makeChain} = createChain();

		chain.deepLink('some deep link');
		assert.deepStrictEqual(makeChain.firstCall.args[0], {deepLink: 'some deep link'});
	});

	it('should throw exception with invalid input', () => {
		const {chain} = createChain();

		testInputErrorSync(chain.deepLink, [3]);
		testInputErrorSync(chain.deepLink, [null]);
		testInputErrorSync(chain.deepLink, [{}]);
		testInputErrorSync(chain.deepLink, [[]]);
		testInputErrorSync(chain.deepLink, [false]);
	});
});
