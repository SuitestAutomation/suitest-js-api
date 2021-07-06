const assert = require('assert');
const suitest = require('../../index');
const {
	unlock,
	unlockAssert,
	getComposers,
	toJSON,
} = require('../../lib/chains/unlockChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Unlock chain', () => {
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

		const chain = unlock(1111);

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			passcode: 1111,
		}), {
			type: 'testLine',
			request: {
				type: 'unlock',
				passcode: 1111,
			},
		}, 'type testLine');
		assert.deepStrictEqual(toJSON({passcode: 1111}), {
			type: 'eval',
			request: {
				type: 'unlock',
				passcode: 1111,
			},
		}, 'type eval');
		assert.deepStrictEqual(toJSON({}), {
			type: 'eval',
			request: {
				type: 'unlock',
			},
		}, 'type eval without passcode');
	});

	it('should define assert function', () => {
		const chain = unlockAssert(1111);

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(unlock, []);
		testInputErrorSync(unlock, [-1]);
	});
});
