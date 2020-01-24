const assert = require('assert');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	openApp,
	openAppAssert,
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/openAppChain');
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes, assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');

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
		assert.strictEqual(toString({
			request: {},
		}), 'Opening app at homepage');
		assert.strictEqual(toString({
			request: {
				relativeUrl: '/test',
			},
		}), 'Opening app at /test');
		// should convert to string with meaningful message with raw json definition
		assert.strictEqual(toString({}), 'Opening app at homepage');
		assert.strictEqual(toString({relativeUrl: '/test'}), 'Opening app at /test');
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');
		const beforeSendMsgContains = assertBeforeSendMsg(beforeSendMsg, log);

		beforeSendMsgContains({}, 'Launcher E Opening app at homepage');
		beforeSendMsgContains({isAssert: true}, 'Launcher A Opening app at homepage');
		log.restore();
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

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(openApp, [1]);
		testInputErrorSync(openApp, ['']);
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
