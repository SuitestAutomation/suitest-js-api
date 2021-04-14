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

describe('Suspend app data chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.GETTERS,
			composers.ASSERT,
			composers.TO_JSON,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.CLONE,
			composers.GETTERS,
			composers.ASSERT,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned chain');

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
		});
	});

	it('should define assert function', () => {
		const chain = suspendAppAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
