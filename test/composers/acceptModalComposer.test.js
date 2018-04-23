const assert = require('assert');
const sinon = require('sinon');
const {acceptModalComposer} = require('../../lib/composers');
const testInputError = require('../../lib/utils/testHelpers/testInputError');

describe('Accept Modal Composer', () => {
	it('should provide .acceptModal method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, acceptModalComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.acceptModal, 'function');

		const sacceptModalDescriptor = Object.getOwnPropertyDescriptor(chain, 'acceptModal');

		assert.strictEqual(sacceptModalDescriptor.enumerable, true);
		assert.strictEqual(sacceptModalDescriptor.writable, false);
		assert.strictEqual(sacceptModalDescriptor.configurable, false);
	});

	it('should set isAcceptModal flag when object converts to acceptModal', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, acceptModalComposer(data, chain, makeChain));

		chain.acceptModal();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isAcceptModal: true,
			acceptModalMessage: null,
		});
	});

	it('should set isAcceptModal and acceptModalMessage flags', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, acceptModalComposer(data, chain, makeChain));

		chain.acceptModal('message');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			isAcceptModal: true,
			acceptModalMessage: 'message',
		});
	});

	it('throw error if value is invalid', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, acceptModalComposer(data, chain, makeChain));

		await testInputError(chain.acceptModal, [1]);
	});
});
