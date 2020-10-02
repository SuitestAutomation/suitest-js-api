const assert = require('assert');
const suitest = require('../../index');
const {
	pollUrl,
	pollUrlAssert,
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/pollUrlChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes, assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');

describe('Poll URL chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.GETTERS,
			composers.CLONE,
			composers.ASSERT,
			composers.TO_JSON,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.CLONE,
			composers.ASSERT,
			composers.TO_STRING,
			composers.THEN,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned chain');

		const chain = pollUrl('url', 'res');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			url: 'url',
			response: true,
		}), {
			type: 'eval',
			request: {
				type: 'pollUrl',
				url: 'url',
				response: true,
			},
		}, 'testLine');

		assert.deepStrictEqual(toJSON({}), {
			type: 'eval',
			request: {
				type: 'pollUrl',
				url: '',
				response: '',
			},
		}, 'testLine');

		assert.deepStrictEqual(toJSON({
			isAssert: true,
			url: 'someUrl',
		}), {
			type: 'testLine',
			request: {
				type: 'pollUrl',
				url: 'someUrl',
				response: '',
			},
		}, 'testLine');
	});

	it('should define assert function', () => {
		const chain = pollUrlAssert('url', 'true');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
