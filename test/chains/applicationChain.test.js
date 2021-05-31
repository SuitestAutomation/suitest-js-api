const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	application,
	applicationAssert,
	getComposers,
	toJSON,
} = require('../../lib/chains/applicationChain')(suitest);
const composers = require('../../lib/constants/composer');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');

describe('Application chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.ASSERT,
			composers.CLONE,
			composers.CLOSE_APP,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
			composers.SUSPEND_APP,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ASSERT,
			composers.CLONE,
			composers.CLOSE_APP,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
			composers.SUSPEND_APP,
		].sort(bySymbol), 'abandoned chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAssert: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.CLOSE_APP,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
			composers.SUSPEND_APP,
		].sort(bySymbol), 'assert chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			comparator: {type: SUBJ_COMPARATOR.HAS_EXITED},
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.ASSERT,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'chain with comparator');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			timeout: 1000,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.CLOSE_APP,
			composers.ASSERT,
			composers.HAS_EXITED,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
			composers.SUSPEND_APP,
		].sort(bySymbol), 'chain with timeout');

		// testing sendText related modifiers
		const commonApplicationModifiers = [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.ASSERT,
			composers.GETTERS,
			composers.TO_JSON,
		];

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
		})), [
			...commonApplicationModifiers,
			composers.UNTIL,
			composers.INTERVAL,
			composers.REPEAT,
		].sort(bySymbol), 'chain with sendText');
		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: '',
		})), [
			...commonApplicationModifiers,
			composers.UNTIL,
			composers.INTERVAL,
			composers.REPEAT,
		].sort(bySymbol), 'chain with sendText for empty string');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
			interval: 2000,
		})), [
			...commonApplicationModifiers,
			composers.UNTIL,
			composers.REPEAT,
		].sort(bySymbol), 'sendText chain with interval');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
			repeat: 2000,
		})), [
			...commonApplicationModifiers,
			composers.UNTIL,
			composers.INTERVAL,
		].sort(bySymbol), 'sendText chain with repeat');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
			until: 'testCondition',
		})), [
			...commonApplicationModifiers,
			composers.REPEAT,
			composers.INTERVAL,
		].sort(bySymbol), 'sendText chain with until');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			closeApp: true,
		})), [
			...commonApplicationModifiers,
		].sort(bySymbol), 'close command');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			suspendApp: true,
		})), [
			...commonApplicationModifiers,
		].sort(bySymbol), 'suspend command');

		const chain = application();

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		const defaultData = {comparator: {type: SUBJ_COMPARATOR.HAS_EXITED}};

		assert.deepStrictEqual(toJSON(defaultData), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'application',
					},
					type: 'exited',
				},
				timeout: 2000,
			},
		}, 'eval without timeout');

		assert.deepStrictEqual(toJSON({
			...defaultData,
			isAssert: true,
			timeout: 0,
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'application',
					},
					type: 'exited',
				},
			},
		}, 'testLine without timeout');

		assert.deepStrictEqual(toJSON({
			...defaultData,
			isAssert: true,
			timeout: 1000,
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'application',
					},
					type: 'exited',
				},
				timeout: 1000,
			},
		}, 'testLine without timeout');

		assert.deepStrictEqual(toJSON({
			isAssert: true,
			sendText: 'text',
		}), {
			type: 'testLine',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 1,
				delay: 1,
				val: 'text',
			},
		}, 'asserted application sendText');

		assert.deepStrictEqual(toJSON({
			isAssert: true,
			sendText: '',
		}), {
			type: 'testLine',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 1,
				delay: 1,
				val: '',
			},
		}, 'application sendText with empty string');

		assert.deepStrictEqual(toJSON({
			sendText: 'text',
		}), {
			type: 'eval',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 1,
				delay: 1,
				val: 'text',
			},
		}, 'application sendText');

		assert.deepStrictEqual(toJSON({
			sendText: 'text',
			interval: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 1,
				delay: 2000,
				val: 'text',
			},
		}, 'application sendText with interval');

		assert.deepStrictEqual(toJSON({
			sendText: 'text',
			repeat: 3,
		}), {
			type: 'eval',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 3,
				delay: 1,
				val: 'text',
			},
		}, 'application sendText with repeat');

		assert.deepStrictEqual(toJSON({
			sendText: 'text',
			interval: 2000,
			repeat: 3,
		}), {
			type: 'eval',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 3,
				delay: 2000,
				val: 'text',
			},
		}, 'application sendText with repeat and interval');

		assert.deepStrictEqual(toJSON({
			suspendApp: true,
		}), {
			type: 'eval',
			request: {
				type: 'suspendApp',
			},
		}, 'application suspended');

		assert.deepStrictEqual(toJSON({
			closeApp: true,
		}), {
			type: 'eval',
			request: {
				type: 'closeApp',
			},
		}, 'application closed');
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(toJSON, [{}]);
	});

	it('should define assert function', () => {
		const chain = applicationAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
