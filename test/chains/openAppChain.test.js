const assert = require('assert');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');
const {
	openApp,
	openAppAssert,
	getComposers,
	toString,
	toJSON,
} = require('../../lib/chains/openAppChain');
const composers = require('../../lib/constants/composer');
const SuitestError = require('../../lib/utils/SuitestError');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');

describe('Open app chain', () => {
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

		const chain = openApp();

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString({}), 'Open app');
		assert.equal(toString({relativeURL: '/test'}), 'Open app at /test');
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({}), {
			type: 'eval',
			request: {
				type: 'openApp',
			},
		}, 'eval with no relative URL');

		assert.deepStrictEqual(toJSON({relativeURL: '/test'}), {
			type: 'eval',
			request: {
				type: 'openApp',
				relativeUrl: '/test',
			},
		}, 'eval with relative URL');

		assert.deepStrictEqual(toJSON({isAssert: true}), {
			type: 'testLine',
			request: {
				type: 'openApp',
			},
		}, 'assert');
	});

	it('should throw error in case of invalid input', async() => {
		await assertThrowsAsync(openApp.bind(null, 1), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if 1');

		await assertThrowsAsync(openApp.bind(null, ''), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if ""');
	});

	it('should define assert function', () => {
		const chain = openAppAssert('url');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
