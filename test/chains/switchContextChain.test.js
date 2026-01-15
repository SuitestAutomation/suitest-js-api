const assert = require('assert').strict;
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const SuitestApi = require('../../suitest');

const suitest = new SuitestApi();

describe('Switch context chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = suitest.switchContext(suitest.CONTEXT.NATIVE);

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
	});

	it('should throw error if context not specified', () => {
		testInputErrorSync(suitest.switchContext, []);
		testInputErrorSync(suitest.switchContext, ['']);
		testInputErrorSync(suitest.switchContext, ['any random value']);
	});

	it('should generate correct socket message for NATIVE context', () => {
		assert.deepEqual(
			suitest.switchContext(suitest.CONTEXT.NATIVE).abandon().toJSON(),
			{
				type: 'eval',
				request: {
					type: 'switchContext',
					context: 'native',
				},
			},
		);
	});

	it('should generate correct socket message for WEBVIEW context', () => {
		assert.deepEqual(
			suitest.switchContext(suitest.CONTEXT.WEBVIEW).abandon().toJSON(),
			{
				type: 'eval',
				request: {
					type: 'switchContext',
					context: 'webview',
				},
			},
		);
	});
});
