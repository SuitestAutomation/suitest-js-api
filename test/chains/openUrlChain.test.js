const assert = require('assert');
const testInputError = require('../../lib/utils/testHelpers/testInputError');
const {
	openUrl,
	openUrlAssert,
	getComposers,
	toString,
	toJSON,
} = require('../../lib/chains/openUrlChain');
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');

describe('Open URL chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.ASSERT,
			composers.CLONE,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ASSERT,
			composers.CLONE,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAssert: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'assert chain');

		const chain = openUrl('url');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString({absoluteURL: '/test'}), 'Open URL /test');
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({absoluteURL: '/test'}), {
			type: 'eval',
			request: {
				type: 'openUrl',
				url: '/test',
			},
		}, 'eval');

		assert.deepStrictEqual(toJSON({
			isAssert: true,
			absoluteURL: '/test',
		}), {
			type: 'testLine',
			request: {
				type: 'openUrl',
				url: '/test',
			},
		}, 'assert');
	});

	it('should throw error in case of invalid input', async() => {
		await testInputError(openUrl, []);
		await testInputError(openUrl, [1]);
		await testInputError(openUrl, ['']);
	});

	it('should define assert function', () => {
		const chain = openUrlAssert('url');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
