const assert = require('assert');
const sinon = require('sinon');
const {dismissModalComposer} = require('../../lib/composers');

describe('dismissModal composer', () => {
	it('should define dismissModal method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, dismissModalComposer(data, chain, makeChain));

		const dismissModalPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'dismissModal');

		assert.strictEqual(typeof chain.dismissModal, 'function', 'is a Function');
		assert.strictEqual(dismissModalPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(dismissModalPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(dismissModalPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set isDismissModal flag when object converts to dismissModal', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, dismissModalComposer(data, chain, makeChain));

		chain.dismissModal();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {isDismissModal: true});
	});
});
