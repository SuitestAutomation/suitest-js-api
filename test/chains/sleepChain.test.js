const assert = require('assert');
const {
	sleep,
	sleepAssert,
	getComposers,
	toString,
	toJSON,
	methodToString,
} = require('../../lib/chains/sleepChain');
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Sleep chain', () => {
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

		const chain = sleep(10);

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString({milliseconds: 10}), 'Sleep for 10ms');
	});

	it('should have methodToString', () => {
		assert.ok(methodToString({milliseconds: 10}), 'methodToString exists');
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			milliseconds: 10,
		}), {
			type: 'testLine',
			request: {
				type: 'sleep',
				timeout: 10,
			},
		}, 'type testLine');
		assert.deepStrictEqual(toJSON({
			milliseconds: 10,
		}), {
			type: 'eval',
			request: {
				type: 'sleep',
				timeout: 10,
			},
		}, 'type eval');
	});

	it('should define assert function', () => {
		const chain = sleepAssert(1000);

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(sleep, []);
		testInputErrorSync(sleep, ['text']);
		testInputErrorSync(sleep, [-1]);
	});
});
