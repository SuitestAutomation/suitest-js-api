const assert = require('assert');
const suitest = require('../../index');
const {
	lock,
	lockAssert,
	getComposers,
	toJSON,
} = require('../../lib/chains/lockChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('lock chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.GETTERS,
			composers.ASSERT,
			composers.CLONE,
			composers.TO_JSON,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.GETTERS,
			composers.ASSERT,
			composers.CLONE,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned chain');

		const chain = lock();

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
		}), {
			type: 'testLine',
			request: {
				type: 'lock',
			},
		}, 'type testLine');
		assert.deepStrictEqual(toJSON({
		}), {
			type: 'eval',
			request: {
				type: 'lock',
			},
		}, 'type eval');
	});

	it('should define assert function', () => {
		const chain = lockAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(lock, []);
		testInputErrorSync(lock, [-1]);
	});
});
