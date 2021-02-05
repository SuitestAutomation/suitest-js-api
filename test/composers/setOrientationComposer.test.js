const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {setOrientationComposer} = require('../../lib/composers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('setOrientationComposer Composer', () => {
	it('should provide .setOrientation method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, setOrientationComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.setOrientation, 'function');

		const setOrientationDescriptor = Object.getOwnPropertyDescriptor(chain, 'setOrientation');

		assert.strictEqual(setOrientationDescriptor.enumerable, true);
		assert.strictEqual(setOrientationDescriptor.writable, false);
		assert.strictEqual(setOrientationDescriptor.configurable, false);
	});

	it('throw error if value is invalid', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, setOrientationComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.setOrientation, [1]);
	});
});
