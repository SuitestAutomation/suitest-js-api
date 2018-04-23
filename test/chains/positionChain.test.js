const assert = require('assert');
const SuitestError = require('../../lib/utils/SuitestError');
const {
	position,
	positionAssert,
	toJSON,
} = require('../../lib/chains/positionChain');

describe('Position chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = position(10, 20);

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.toJSON, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.click, 'function');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'function');
		assert.strictEqual(typeof chain.toAssert, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after toAssert is applied', () => {
		const chain = position(1, 1).click().toAssert();

		assert.strictEqual(typeof chain.toAssert, 'undefined');
	});

	it('should have only allowed modifiers after click is applied', () => {
		const chain = position(1, 1).click();

		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
	});

	it('should have only allowed modifiers after moveTo is applied', () => {
		const chain = position(1, 1).moveTo();

		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
	});

	it('should have only allowed modifiers after abandon is applied', () => {
		const chain = position(1, 1).abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(
			position(1, 1).toString(),
			'Position 1, 1'
		);
		assert.equal(
			position(1, 1).click().toString(),
			'Click on 1, 1 position'
		);
		assert.equal(
			position(1, 1).click().repeat(10).interval(2000).toString(),
			'Click on 1, 1 position 10 times every 2000ms'
		);
		assert.equal(
			position(1, 1).click()
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
			'Click on 1, 1 position 10 times every 2000ms'
		);
		assert.equal(
			position(1, 1).moveTo().toString(),
			'Move cursor to 1, 1 position'
		);
	});

	it('should throw error in case of invalid input', () => {
		assert.throws(position.bind(null, 1), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if 1');
		assert.throws(position.bind(null, null, 1), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if null, 1');
		assert.throws(position.bind(null, 'string', 1), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if "string", 1');
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			coordinates: {
				x: 10,
				y: 20,
			},
			isClick: true,
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'click',
				clicks: [{
					type: 'single',
					button: 'left',
				}],
				count: 2,
				delay: 2000,
				target: {
					type: 'window',
					coordinates: {
						x: 10,
						y: 20,
					},
				},
			},
		}, 'type testLine default');
		assert.deepStrictEqual(toJSON({
			coordinates: {
				x: 100,
				y: 200,
			},
			isMoveTo: true,
		}), {
			type: 'eval',
			request: {
				type: 'moveTo',
				target: {
					type: 'window',
					coordinates: {
						x: 100,
						y: 200,
					},
				},
			},
		}, 'type eval default');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			coordinates: {
				x: 10,
				y: 20,
			},
			isClick: true,
			repeat: 2,
			interval: 2000,
			until: 'testCondition',
		}), {
			type: 'testLine',
			request: {
				type: 'click',
				clicks: [{
					type: 'single',
					button: 'left',
				}],
				count: 2,
				delay: 2000,
				target: {
					type: 'window',
					coordinates: {
						x: 10,
						y: 20,
					},
				},
				condition: 'testCondition',
			},
		}, 'type testLine click until');
	});

	it('should define assert function', () => {
		const chain = positionAssert(1, 1);

		assert.strictEqual('toAssert' in chain, false);
	});
});
