const assert = require('assert');
const {
	clearAppData,
	clearAppDataAssert,
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/clearAppDataChain');
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');

describe('Clear app data chain', () => {
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

		const chain = clearAppData();

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({}), {
			type: 'eval',
			request: {
				type: 'clearAppData',
			},
		});
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString(), 'Cleared app data');
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');

		beforeSendMsg();
		assert.ok(log.firstCall.args[0], 'beforeSendMsg exists');
		log.restore();
	});

	it('should define assert function', () => {
		const chain = clearAppDataAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
