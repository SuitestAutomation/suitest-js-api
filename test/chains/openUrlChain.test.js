const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	openUrl,
	openUrlAssert,
	getComposers,
	toJSON,
} = require('../../lib/chains/openUrlChain')(suitest);
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

	it('should return text representation of openUrl line', () => {
		assert.strictEqual(
			openUrl('https://suite.st/').toString(),
			'|E|Open URL\n  URL = \x1B[4mhttps://suite.st/\x1B[0m',
		);
		assert.strictEqual(
			openUrlAssert('https://suite.st/').toString(),
			'|A|Open URL\n  URL = \x1B[4mhttps://suite.st/\x1B[0m',
		);
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(openUrl, []);
		testInputErrorSync(openUrl, [1]);
		testInputErrorSync(openUrl, ['']);
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
