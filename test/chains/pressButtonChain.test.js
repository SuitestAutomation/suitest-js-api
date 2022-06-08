const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	pressButton,
	pressButtonAssert,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/pressButtonChain')(suitest);
const buttonTypes = require('../../lib/constants/vrc');
const {VRC} = require('../../lib/mappings');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');

describe('Press button chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = pressButton(buttonTypes.BACK);

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toAssert, 'function');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have allowed modifiers after abandon', () => {
		const chain = pressButton(buttonTypes.BACK).abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(pressButton, []);
		// empty string is invalid
		testInputErrorSync(pressButton, [['', 'Down']]);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			ids: [buttonTypes.UP],
		}), {
			type: 'testLine',
			request: {
				type: 'button',
				ids: [VRC[buttonTypes.UP]],
				count: 1,
				delay: 1,
			},
		}, 'type testLine default');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			ids: [buttonTypes.UP],
			longPressMs: 1000,
		}), {
			type: 'testLine',
			request: {
				type: 'button',
				ids: [VRC[buttonTypes.UP]],
				longPressMs: 1000,
				count: 1,
				delay: 1,
			},
		}, 'long press type testLine default');
		assert.deepStrictEqual(toJSON({
			ids: [buttonTypes.UP],
			repeat: 10,
			interval: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'button',
				ids: [VRC[buttonTypes.UP]],
				count: 10,
				delay: 2000,
			},
		}, 'type eval default');
		assert.deepStrictEqual(toJSON({
			ids: [buttonTypes.UP],
			repeat: 10,
			interval: 2000,
			until: 'testCondition',
		}), {
			type: 'eval',
			request: {
				type: 'button',
				ids: [VRC[buttonTypes.UP]],
				count: 10,
				delay: 2000,
				condition: 'testCondition',
			},
		}, 'type eval default');
	});

	it('should define assert function', () => {
		const chain = pressButtonAssert(buttonTypes.DOWN);

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});
});
