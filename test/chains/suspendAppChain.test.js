const assert = require('assert');
const suitest = require('../../index');
const {
	suspendApp,
	suspendAppAssert,
	getComposers,
	toJSON,
} = require('../../lib/chains/suspendAppChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');

describe('Suspend app chain', () => {
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

		const chain = suspendApp();

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({}), {
			type: 'eval',
			request: {
				type: 'suspendApp',
			},
		}, 'eval with no relative URL');

		assert.deepStrictEqual(toJSON({isAssert: true}), {
			type: 'testLine',
			request: {
				type: 'suspendApp',
			},
		}, 'assert');
	});

	it('should define assert function', () => {
		const chain = suspendAppAssert('url');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
