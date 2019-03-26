const assert = require('assert');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	application,
	applicationAssert,
	getComposers,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/applicationChain');
const composers = require('../../lib/constants/composer');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');

describe('Application chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.ASSERT,
			composers.CLONE,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ASSERT,
			composers.CLONE,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
		].sort(bySymbol), 'abandoned chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAssert: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
		].sort(bySymbol), 'assert chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			comparator: {},
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.ASSERT,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
		].sort(bySymbol), 'chain with comparator');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			timeout: 1000,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.ASSERT,
			composers.HAS_EXITED,
			composers.GETTERS,
			composers.TO_JSON,
			composers.SEND_TEXT,
		].sort(bySymbol), 'chain with timeout');

		// testing sendText related modifiers
		const commonSendTextModifiers = [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.ASSERT,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
		];

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
		})), [
			...commonSendTextModifiers,
			composers.UNTIL,
			composers.INTERVAL,
			composers.REPEAT,
		].sort(bySymbol), 'chain with sendText');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
			interval: 2000,
		})), [
			...commonSendTextModifiers,
			composers.UNTIL,
			composers.REPEAT,
		].sort(bySymbol), 'sendText chain with interval');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
			repeat: 2000,
		})), [
			...commonSendTextModifiers,
			composers.UNTIL,
			composers.INTERVAL,
		].sort(bySymbol), 'sendText chain with repeat');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			sendText: 'some text',
			until: 'testCondition',
		})), [
			...commonSendTextModifiers,
			composers.REPEAT,
			composers.INTERVAL,
		].sort(bySymbol), 'sendText chain with until');

		const chain = application();

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should convert to string with meaningful message', () => {
		const sendTextApp = application().sendText('some text');
		const untilData = {
			toJSON: () => ({
				request: {
					condition: {
						subject: {
							type: 'location',
						},
					},
				},
			}),
		};

		assert.strictEqual(application().toString(), 'Application has exited');
		assert.strictEqual(sendTextApp.toString(), 'Sending text "some text" to application');
		assert.strictEqual(sendTextApp.repeat(2).toString(), 'Sending text "some text" to application, repeat 2 times');
		assert.strictEqual(sendTextApp.interval(2222).toString(), 'Sending text "some text" to application');
		assert.strictEqual(
			sendTextApp.repeat(3).interval(2222).toString(),
			'Sending text "some text" to application, repeat 3 times every 2222 ms');
		assert.strictEqual(sendTextApp.until(untilData).toString(), 'Sending text "some text" to application');
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');

		beforeSendMsg();
		assert.ok(log.firstCall.args[0], 'beforeSendMsg exists');
		log.restore();
	});

	it('should generate correct socket message based on data', () => {
		const defaultData = {comparator: {type: SUBJ_COMPARATOR.HAS_EXITED}};

		assert.deepStrictEqual(toJSON(defaultData), {
			type: 'eval',
			request: {
				type: 'wait',
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
				type: 'wait',
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
		}, 'application sendText');

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
