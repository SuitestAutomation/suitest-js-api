const assert = require('assert');
const SuitestError = require('../../lib/utils/SuitestError');
const {
	element,
	elementAssert,
	toJSON,
} = require('../../lib/chains/elementChain');
const {VALUE, ELEMENT_PROP} = require('../../lib/constants/element');
const {PROP_COMPARATOR, SUBJ_COMPARATOR} = require('../../lib/constants/comparator');

describe('Element chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = element('element');

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.exist, 'function');
		assert.strictEqual(typeof chain.exists, 'function');
		assert.strictEqual(typeof chain.match, 'function');
		assert.strictEqual(typeof chain.matches, 'function');
		assert.strictEqual(typeof chain.matchRepo, 'function');
		assert.strictEqual(typeof chain.matchesRepo, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.click, 'function');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'function');
		assert.strictEqual(typeof chain.sendText, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after match is applied', () => {
		const chain = element('element').match(ELEMENT_PROP.ID);

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
	});

	it('should have only allowed modifiers after click is applied', () => {
		const chain = element('element').click();

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
	});

	it('should have only allowed modifiers after moveTo is applied', () => {
		const chain = element('element').moveTo();

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
	});

	it('should have only allowed modifiers after sendText is applied', () => {
		const chain = element('element').sendText('text');

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
	});

	it('should have only allowed modifiers after matchJS is applied', () => {
		const chain = element('element').abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should have only allowed modifiers after not is applied', () => {
		const chain = element('element').not();

		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(element('element').toString(), 'Get element element properties');
		assert.equal(element('element').exists().toString(), 'Check if element element exists');
		assert.equal(
			element('element').matchesJS('').toString(),
			'Check if element element matches JavaScript expression'
		);
		assert.equal(
			element('element').matches(ELEMENT_PROP.ID).toString(),
			'Check if element element has defined properties'
		);
		assert.equal(
			element('element').matches({name: ELEMENT_PROP.ID}).toString(),
			'Check if element element has defined properties'
		);
		assert.equal(
			element('element').click().toString(),
			'Click on element element'
		);
		assert.equal(
			element('element').click().repeat(10).interval(2000).toString(),
			'Click on element element 10 times every 2000ms'
		);
		assert.equal(
			element('element').click().repeat(10).interval(2000).until({
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
				.toString(),
			'Click on element element 10 times every 2000ms'
		);
		assert.equal(
			element('element').moveTo().toString(),
			'Move cursor to element element'
		);
		assert.equal(
			element('element').sendText('text').toString(),
			'Send text \'text\' to element element'
		);
		assert.equal(
			element('element').sendText('text').repeat(10).interval(2000).toString(),
			'Send text \'text\' to element element 10 times every 2000ms'
		);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			selector: {css: '.element'},
			repeat: 2,
			interval: 2000,
		}), {
			type: 'query',
			subject: {
				type: 'elementProps',
				selector: {css: '.element'},
			},
		}, 'query');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			isClick: true,
			selector: {apiId: 'apiId'},
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
					type: 'element',
					apiId: 'apiId',
				},
			},
		}, 'testLine click');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			isClick: true,
			selector: {apiId: 'apiId'},
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
					type: 'element',
					apiId: 'apiId',
				},
				condition: 'testCondition',
			},
		}, 'testLine click until');
		assert.deepStrictEqual(toJSON({
			isClick: true,
			selector: {css: 'css'},
		}), {
			type: 'eval',
			request: {
				type: 'click',
				clicks: [{
					type: 'single',
					button: 'left',
				}],
				count: 1,
				delay: 1000,
				target: {
					type: 'element',
					val: {css: 'css'},
				},
			},
		}, 'eval click');
		assert.deepStrictEqual(toJSON({
			isMoveTo: true,
			selector: {apiId: 'apiId'},
		}), {
			type: 'eval',
			request: {
				type: 'moveTo',
				target: {
					type: 'element',
					apiId: 'apiId',
				},
			},
		}, 'eval moveTo');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			sendText: 'text',
			selector: {apiId: 'apiId'},
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'sendText',
				count: 2,
				delay: 2000,
				target: {
					type: 'element',
					apiId: 'apiId',
				},
				val: 'text',
			},
		}, 'testLine sendText');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			sendText: 'text',
			selector: {apiId: 'apiId'},
			repeat: 2,
			interval: 2000,
			until: 'testCondition',
		}), {
			type: 'testLine',
			request: {
				type: 'sendText',
				count: 2,
				delay: 2000,
				target: {
					type: 'element',
					apiId: 'apiId',
				},
				val: 'text',
				condition: 'testCondition',
			},
		}, 'testLine sendText until');
		assert.deepStrictEqual(toJSON({
			isNegated: true,
			comparator: {
				type: SUBJ_COMPARATOR.EXIST,
			},
			selector: {apiId: 'apiId'},
			timeout: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'element',
						apiId: 'apiId',
					},
					type: '!exists',
				},
				timeout: 2000,
			},
		}, 'element does not exist testLine');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			comparator: {
				type: SUBJ_COMPARATOR.MATCH_JS,
				val: '1+1',
			},
			selector: {apiId: 'apiId'},
		}), {
			type: 'testLine',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'element',
						apiId: 'apiId',
					},
					type: 'matches',
					val: '1+1',
				},
				timeout: 2000,
			},
		}, 'element mathces js testLine');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.TOP,
						val: 500,
						type: PROP_COMPARATOR.GREATER,
						deviation: undefined,
					},
					{
						name: ELEMENT_PROP.BG_COLOR,
						val: VALUE.REPO,
						type: PROP_COMPARATOR.EQUAL,
						deviation: undefined,
					},
					{
						name: ELEMENT_PROP.WIDTH,
						val: 1024,
						type: PROP_COMPARATOR.APPROX,
						deviation: 100,
					},
				],
			},
			selector: {apiId: 'apiId'},
		}), {
			type: 'testLine',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'element',
						apiId: 'apiId',
					},
					expression: [
						{
							property: 'top',
							val: 500,
							type: '>',
						},
						{
							property: 'backgroundColor',
							inherited: true,
							type: '=',
						},
						{
							property: 'width',
							val: 1024,
							type: '+-',
							deviation: 100,
						},
					],
					type: 'has',
				},
				timeout: 2000,
			},
		}, 'element has props js testLine');
	});

	it('should throw error in case of invalid input', async() => {
		try {
			await element('');
			assert.ok(false, 'no error');
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.INVALID_INPUT, 'code');
		}

		try {
			await element({'noRequiredSelector': true});
			assert.ok(false, 'no error');
		} catch (error) {
			assert.ok(error, 'error');
			assert.strictEqual(error.code, SuitestError.INVALID_INPUT, 'code');
		}
	});

	it('should define assert function', () => {
		const chain = elementAssert('element');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
