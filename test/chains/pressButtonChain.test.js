const assert = require('assert');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');
const {
	pressButton,
	pressButtonAssert,
	toJSON,
} = require('../../lib/chains/pressButtonChain');
const buttonTypes = require('../../lib/constants/vrc');
const SuitestError = require('../../lib/utils/SuitestError');
const {VRC} = require('../../lib/mappings');

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

	it('should convert to string with meaningful message', () => {
		assert.equal(pressButton(buttonTypes.BACK).toString(), 'Press button BACK');
		assert.equal(
			pressButton([buttonTypes.BLUE, buttonTypes.DOWN]).toString(),
			'Press buttons BLUE, DOWN'
		);
		assert.equal(
			pressButton(buttonTypes.BLUE).repeat(10).toString(),
			'Press button BLUE 10 times every 500ms'
		);
		assert.equal(
			pressButton(buttonTypes.BLUE).repeat(10).interval(2000).toString(),
			'Press button BLUE 10 times every 2000ms'
		);
		assert.equal(
			pressButton(buttonTypes.BLUE)
				.until({
					toJSON: () => ({
						request: {
							condition: {
								subject: {
									type: 'location',
								},
							},
						},
					}),
				})
				.repeat(10).interval(2000).toString(),
			'Press button BLUE 10 times every 2000ms'
		);
	});

	it.skip('should engage execution on "then"', async() => {
		assert.deepStrictEqual(await pressButton(buttonTypes.BLUE), 'press');
	});

	it('should throw error in case of invalid input', async() => {
		await assertThrowsAsync(pressButton.bind(null, undefined), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if undefined');

		await assertThrowsAsync(pressButton.bind(null, ['Up', 'Down']), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if ["Up", "Down"]');
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
				delay: 1000,
			},
		}, 'type testLine default');
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
