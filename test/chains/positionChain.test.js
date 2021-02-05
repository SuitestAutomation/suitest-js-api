const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	position,
	positionAssert,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/positionChain')(suitest);
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');

describe('Position chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = position(10, 20);

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.toJSON, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.click, 'function');
		assert.strictEqual(typeof chain.scroll, 'function');
		assert.strictEqual(typeof chain.swipe, 'function');
		assert.strictEqual(typeof chain.flick, 'function');
		assert.strictEqual(typeof chain.tap, 'function');
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
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
	});

	it('should have only allowed modifiers after moveTo is applied', () => {
		const chain = position(1, 1).moveTo();

		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
	});

	it('should have only allowed modifiers after tap is applied', () => {
		const chain = position(1, 1).tap('single');

		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
	});

	it('should have only allowed modifiers after scroll is applied', () => {
		const chain = position(1, 1).scroll('up', 1, 1);

		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
	});

	it('should have only allowed modifiers after swipe is applied', () => {
		const chain = position(1, 1).swipe('up', 1, 1, 1);

		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
	});

	it('should have only allowed modifiers after abandon is applied', () => {
		const chain = position(1, 1).abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(position, [1]);
		testInputErrorSync(position, [null, 1]);
		testInputErrorSync(position, ['string', 1]);
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
			isAssert: true,
			coordinates: {
				x: 10,
				y: 20,
			},
			tap: 'single',
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'tap',
				taps: [{
					type: 'single',
				}],
				count: 2,
				delay: 2000,
				target: {
					type: 'screen',
					coordinates: {
						x: 10,
						y: 20,
					},
				},
			},
		}, 'type testLine tap');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			coordinates: {
				x: 10,
				y: 20,
			},
			isScroll: true,
			direction: 'up',
			distance: 2,
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'scroll',
				scroll: [{
					direction: 'up',
					distance: 2,
				}],
				count: 2,
				delay: 2000,
				target: {
					type: 'screen',
					coordinates: {
						x: 10,
						y: 20,
					},
				},
			},
		}, 'type testLine scroll');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			coordinates: {
				x: 10,
				y: 20,
			},
			isSwipe: true,
			direction: 'up',
			distance: 2,
			duration: 1,
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'swipe',
				swipe: [{
					direction: 'up',
					distance: 2,
					duration: 1,
				}],
				count: 2,
				delay: 2000,
				target: {
					type: 'screen',
					coordinates: {
						x: 10,
						y: 20,
					},
				},
			},
		}, 'type testLine swipe/flick');
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
