const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {setSizeComposer} = require('../../lib/composers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Set Size Composer', () => {
	it('should provide .setSize method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, setSizeComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.setSize, 'function');

		const setSizeDescriptor = Object.getOwnPropertyDescriptor(chain, 'setSize');

		assert.strictEqual(setSizeDescriptor.enumerable, true);
		assert.strictEqual(setSizeDescriptor.writable, false);
		assert.strictEqual(setSizeDescriptor.configurable, false);
	});

	it('should set isSetSize, width, height flags when object converts to setSize', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, setSizeComposer(suitest, data, chain, makeChain));

		chain.setSize(10, 20);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isSetSize: true,
			width: 10,
			height: 20,
		});
	});

	it('should throw error in case of invalid input', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, setSizeComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.setSize, ['string', 10]);
		testInputErrorSync(chain.setSize, [10]);
		testInputErrorSync(chain.setSize, [null, 10]);
	});
});
