const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	relativePosition,
	relativePositionAssert,
	toJSON,
} = require('../../lib/chains/relativePositionChain')(suitest);

describe('Relative position chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = relativePosition(10, 20);

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.toJSON, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.click, 'function');
		assert.strictEqual(typeof chain.moveTo, 'function');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.toAssert, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after toAssert is applied', () => {
		const chain = relativePosition(1, 1).click().toAssert();

		assert.strictEqual(typeof chain.toAssert, 'undefined');
	});

	it('should have only allowed modifiers after click is applied', () => {
		const chain = relativePosition(1, 1).click();

		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
	});

	it('should have only allowed modifiers after moveTo is applied', () => {
		const chain = relativePosition(1, 1).moveTo();

		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
	});

	it('should have only allowed modifiers after abandon is applied', () => {
		const chain = relativePosition(1, 1).abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(relativePosition, [1]);
		testInputErrorSync(relativePosition, [null, 1]);
		testInputErrorSync(relativePosition, ['string', 1]);
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
					relative: true,
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
					relative: true,
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
					relative: true,
				},
				condition: 'testCondition',
			},
		}, 'type testLine click until');
	});

	it('should define assert function', () => {
		const chain = relativePositionAssert(1, 1);

		assert.strictEqual('toAssert' in chain, false);
	});
});
