const assert = require('assert').strict;
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	openDeepLink,
	openDeepLinkAssert,
	toJSON,
	getComposers,
} = require('../../lib/chains/openDeepLinkChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');

describe('Open Deep Link chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepEqual(
			getComposerTypes(getComposers({})),
			[
				composers.TO_STRING,
				composers.THEN,
				composers.ABANDON,
				composers.ASSERT,
				composers.CLONE,
				composers.GETTERS,
				composers.TO_JSON,
			].sort(bySymbol),
			'clear state',
		);

		assert.deepEqual(
			getComposerTypes(getComposers({isAbandoned: true})),
			[
				composers.TO_STRING,
				composers.THEN,
				composers.ASSERT,
				composers.CLONE,
				composers.GETTERS,
				composers.TO_JSON,
			].sort(bySymbol),
			'abandoned chain',
		);

		assert.deepEqual(
			getComposerTypes(getComposers({isAssert: true})),
			[
				composers.TO_STRING,
				composers.THEN,
				composers.ABANDON,
				composers.CLONE,
				composers.GETTERS,
				composers.TO_JSON,
			].sort(bySymbol),
			'assert chain',
		);

		const chain = openDeepLink('some:deep:link');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepEqual(
			toJSON({deepLink: 'deep:link'}),
			{
				type: 'eval',
				request: {
					type: 'openDeepLink',
					deepLink: 'deep:link',
				},
			},
			'deep link eval json message',
		);

		assert.deepEqual(
			toJSON({isAssert: true, deepLink: 'deep:link'}),
			{
				type: 'testLine',
				request: {
					type: 'openDeepLink',
					deepLink: 'deep:link',
				},
			},
			'deep link assert json message',
		);
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(openDeepLink, [null]);
		testInputErrorSync(openDeepLink, [1]);
		testInputErrorSync(openDeepLink, [0]);
		testInputErrorSync(openDeepLink, [true]);
		testInputErrorSync(openDeepLink, [{}]);
	});

	it('should define assert function', () => {
		const chain = openDeepLinkAssert('deep:link');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
