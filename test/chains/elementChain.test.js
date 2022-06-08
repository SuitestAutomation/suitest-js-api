const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	element,
	elementAssert,
	toJSON,
} = require('../../lib/chains/elementChain')(suitest, suitest.video);
const {VALUE, ELEMENT_PROP} = require('../../lib/constants/element');
const VISIBILITY_STATE = require('../../lib/constants/visibilityState');
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
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.exist, 'function');
		assert.strictEqual(typeof chain.exists, 'function');
		assert.strictEqual(typeof chain.visible, 'function');
		assert.strictEqual(typeof chain.match, 'function');
		assert.strictEqual(typeof chain.matches, 'function');
		assert.strictEqual(typeof chain.matchRepo, 'function');
		assert.strictEqual(typeof chain.matchesRepo, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		// assert.strictEqual(typeof chain.matchBrightScript, 'function');
		// assert.strictEqual(typeof chain.matchesBrightScript, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.click, 'function');
		assert.strictEqual(typeof chain.tap, 'function');
		assert.strictEqual(typeof chain.scroll, 'function');
		assert.strictEqual(typeof chain.swipe, 'function');
		assert.strictEqual(typeof chain.flick, 'function');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.until, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'function');
		assert.strictEqual(typeof chain.sendText, 'function');
		assert.strictEqual(typeof chain.setText, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after match is applied', () => {
		const chain = element('element').match(ELEMENT_PROP.ID);

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.setText, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'undefined');
		assert.strictEqual(typeof chain.isPaused, 'undefined');
		assert.strictEqual(typeof chain.isStopped, 'undefined');
	});

	it('should have only allowed modifiers after click is applied', () => {
		const chain = element('element').click();

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.until, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.setText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'undefined');
		assert.strictEqual(typeof chain.isStopped, 'undefined');
		assert.strictEqual(typeof chain.isPaused, 'undefined');
	});

	it('should have only allowed modifiers after tap is applied', () => {
		const chain = element('element').tap('single');

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.until, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.setText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'undefined');
		assert.strictEqual(typeof chain.isStopped, 'undefined');
		assert.strictEqual(typeof chain.isPaused, 'undefined');
	});

	it('should have only allowed modifiers after scroll is applied', () => {
		const chain = element('element').scroll('up', 1);

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.until, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.setText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'undefined');
		assert.strictEqual(typeof chain.isStopped, 'undefined');
		assert.strictEqual(typeof chain.isPaused, 'undefined');
	});

	it('should have only allowed modifiers after swipe/flick is applied', () => {
		const chain = element('element').swipe('up', 1, 1);

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.interval, 'function');
		assert.strictEqual(typeof chain.until, 'function');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.setText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'undefined');
		assert.strictEqual(typeof chain.isStopped, 'undefined');
		assert.strictEqual(typeof chain.isPaused, 'undefined');
	});

	it('should have only allowed modifiers after moveTo is applied', () => {
		const chain = element('element').moveTo();

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.until, 'undefined');
		assert.strictEqual(typeof chain.moveTo, 'undefined');
		assert.strictEqual(typeof chain.click, 'undefined');
		assert.strictEqual(typeof chain.tap, 'undefined');
		assert.strictEqual(typeof chain.scroll, 'undefined');
		assert.strictEqual(typeof chain.swipe, 'undefined');
		assert.strictEqual(typeof chain.flick, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'undefined');
		assert.strictEqual(typeof chain.setText, 'undefined');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.isPaused, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'undefined');
		assert.strictEqual(typeof chain.isStopped, 'undefined');
	});

	describe('should have only allowed modifiers after sendText is applied', () => {
		function testElementSendTextModifiers(chain) {
			assert.strictEqual(typeof chain.exist, 'undefined');
			assert.strictEqual(typeof chain.exists, 'undefined');
			assert.strictEqual(typeof chain.visible, 'undefined');
			assert.strictEqual(typeof chain.match, 'undefined');
			assert.strictEqual(typeof chain.matches, 'undefined');
			assert.strictEqual(typeof chain.matchRepo, 'undefined');
			assert.strictEqual(typeof chain.matchesRepo, 'undefined');
			assert.strictEqual(typeof chain.matchJS, 'undefined');
			assert.strictEqual(typeof chain.matchesJS, 'undefined');
			assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
			assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
			assert.strictEqual(typeof chain.repeat, 'function');
			assert.strictEqual(typeof chain.interval, 'function');
			assert.strictEqual(typeof chain.until, 'function');
			assert.strictEqual(typeof chain.moveTo, 'undefined');
			assert.strictEqual(typeof chain.click, 'undefined');
			assert.strictEqual(typeof chain.tap, 'undefined');
			assert.strictEqual(typeof chain.scroll, 'undefined');
			assert.strictEqual(typeof chain.swipe, 'undefined');
			assert.strictEqual(typeof chain.flick, 'undefined');
			assert.strictEqual(typeof chain.sendText, 'undefined');
			assert.strictEqual(typeof chain.setText, 'undefined');
			assert.strictEqual(typeof chain.not, 'undefined');
			assert.strictEqual(typeof chain.doesNot, 'undefined');
			assert.strictEqual(typeof chain.isNot, 'undefined');
		}

		it('with empty string as value', () => {
			testElementSendTextModifiers(element('element').sendText(''));
		});

		it('with not empty string as a value', () => {
			testElementSendTextModifiers(element('element').sendText('text'));
		});
	});

	describe('should have only allowed modifiers after setText is applied', () => {
		function testElementSetTextModifiers(chain) {
			assert.strictEqual(typeof chain.exist, 'undefined');
			assert.strictEqual(typeof chain.exists, 'undefined');
			assert.strictEqual(typeof chain.match, 'undefined');
			assert.strictEqual(typeof chain.matches, 'undefined');
			assert.strictEqual(typeof chain.matchRepo, 'undefined');
			assert.strictEqual(typeof chain.matchesRepo, 'undefined');
			assert.strictEqual(typeof chain.matchJS, 'undefined');
			assert.strictEqual(typeof chain.matchesJS, 'undefined');
			assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
			assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
			assert.strictEqual(typeof chain.repeat, 'undefined');
			assert.strictEqual(typeof chain.interval, 'undefined');
			assert.strictEqual(typeof chain.until, 'undefined');
			assert.strictEqual(typeof chain.moveTo, 'undefined');
			assert.strictEqual(typeof chain.click, 'undefined');
			assert.strictEqual(typeof chain.tap, 'undefined');
			assert.strictEqual(typeof chain.scroll, 'undefined');
			assert.strictEqual(typeof chain.swipe, 'undefined');
			assert.strictEqual(typeof chain.flick, 'undefined');
			assert.strictEqual(typeof chain.sendText, 'undefined');
			assert.strictEqual(typeof chain.setText, 'undefined');
			assert.strictEqual(typeof chain.not, 'undefined');
			assert.strictEqual(typeof chain.doesNot, 'undefined');
			assert.strictEqual(typeof chain.isNot, 'undefined');
			assert.strictEqual(typeof chain.isPlaying, 'undefined');
			assert.strictEqual(typeof chain.isStopped, 'undefined');
			assert.strictEqual(typeof chain.isPaused, 'undefined');
		}

		it('for empty string as a value', () => {
			testElementSetTextModifiers(element('element').setText(''));
		});

		it('for not empty string as a value', () => {
			testElementSetTextModifiers(element('element').setText('text'));
		});
	});

	it('should have only allowed modifiers after matchJS is applied', () => {
		const chain = element('element').abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should have only allowed modifiers after not is applied', () => {
		const chain = element('element').not();

		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.visible, 'function');
	});

	it('should generate correct selectors', () => {
		assert.deepStrictEqual(
			element([{css: '#app'}, {css: 'div'}, {css: 'span'}]).toJSON(),
			{
				subject: {
					selector: [
						{css: '#app'},
						{css: 'div'},
						{css: 'span'},
					],
					type: 'elementProps',
				},
				type: 'query',
			},
			'should generate array of selectors',
		);

		assert.deepStrictEqual(
			element({css: 'body'}).toJSON(),
			{
				subject: {
					selector: {css: 'body'},
					type: 'elementProps',
				},
				type: 'query',
			},
			'should generate css selector',
		);

		assert.deepStrictEqual(
			element('element-id').toJSON(),
			{
				subject: {
					selector: {apiId: 'element-id'},
					type: 'elementProps',
				},
				type: 'query',
			},
			'should generate apiId selector',
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
			tap: 'single',
			selector: {apiId: 'apiId'},
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
					type: 'element',
					apiId: 'apiId',
				},
			},
		}, 'testLine tap');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			isScroll: true,
			direction: 'up',
			distance: 1,
			selector: {apiId: 'apiId'},
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'scroll',
				scroll: [{
					distance: 1,
					direction: 'up',
				}],
				count: 2,
				delay: 2000,
				target: {
					type: 'element',
					apiId: 'apiId',
				},
			},
		}, 'testLine scroll');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			isSwipe: true,
			direction: 'up',
			distance: 1,
			duration: 1,
			selector: {apiId: 'apiId'},
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'swipe',
				swipe: [{
					distance: 1,
					direction: 'up',
					duration: 1,
				}],
				count: 2,
				delay: 2000,
				target: {
					type: 'element',
					apiId: 'apiId',
				},
			},
		}, 'testLine swipe/flick');
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
			selector: {
				css: 'css',
				index: 2,
			},
		}), {
			type: 'eval',
			request: {
				type: 'click',
				clicks: [{
					type: 'single',
					button: 'left',
				}],
				count: 1,
				delay: 1,
				target: {
					type: 'element',
					val: {
						css: 'css',
						ifMultipleFoundReturn: 2,
					},
				},
			},
		}, 'eval click');
		assert.deepStrictEqual(toJSON({
			selector: {
				css: 'css',
				index: 2,
			},
		}), {
			type: 'query',
			subject: {
				type: 'elementProps',
				selector: {css: 'css', ifMultipleFoundReturn: 2},
			},
		}, 'query with index');
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
			sendText: '',
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
				val: '',
			},
		}, 'testLine sendText for empty string');
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
			isAssert: true,
			setText: '',
			selector: {apiId: 'apiId'},
		}), {
			type: 'testLine',
			request: {
				type: 'setText',
				target: {
					type: 'element',
					apiId: 'apiId',
				},
				val: '',
			},
		}, 'testLine setText with empty string');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			setText: 'text',
			selector: {apiId: 'apiId'},
		}), {
			type: 'testLine',
			request: {
				type: 'setText',
				target: {
					type: 'element',
					apiId: 'apiId',
				},
				val: 'text',
			},
		}, 'testLine setText');
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
				type: 'assert',
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
			comparator: {
				type: SUBJ_COMPARATOR.VISIBLE,
			},
			selector: {apiId: 'apiId'},
			timeout: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'element',
						apiId: 'apiId',
					},
					type: 'visible',
				},
				timeout: 2000,
			},
		}, 'element visible testLine');
		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.VISIBLE,
			},
			isNegated: true,
			selector: {apiId: 'apiId'},
			timeout: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'element',
						apiId: 'apiId',
					},
					type: '!visible',
				},
				timeout: 2000,
			},
		}, 'element not visible testLine');
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
				type: 'assert',
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
				type: SUBJ_COMPARATOR.MATCH_BRS,
				val: '1+1',
			},
			selector: {apiId: 'apiId'},
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'element',
						apiId: 'apiId',
					},
					type: 'matchesBRS',
					val: '1+1',
				},
				timeout: 2000,
			},
		}, 'element mathces bs testLine');
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
					{
						name: ELEMENT_PROP.VISIBILITY,
						val: VISIBILITY_STATE.VISIBLE,
						type: PROP_COMPARATOR.EQUAL,
					},
					{
						name: ELEMENT_PROP.URL,
						val: 'string',
						type: PROP_COMPARATOR.END,
					},
				],
			},
			selector: {apiId: 'apiId'},
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
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
						{
							property: 'visibility',
							val: 'visible',
							type: '=',
						},
						{
							property: 'url',
							val: 'string',
							type: '$',
						},
					],
					type: 'has',
				},
				timeout: 2000,
			},
		}, 'element has props js testLine');
	});

	it('generate correct ws message for requesting element handle', () => {
		assert.deepStrictEqual(toJSON({
			handle: {multiple: false},
			selector: {handle: true},
		}), {
			subject: {
				type: 'elementHandle',
				multiple: false,
				selector: {
					handle: true,
				},
			},
			type: 'query',
		}, 'get single element handle');
		assert.deepStrictEqual(toJSON({
			handle: {multiple: true},
			selector: {css: 'div'},
		}), {
			subject: {
				type: 'elementHandle',
				multiple: true,
				selector: {
					css: 'div',
				},
			},
			type: 'query',
		}, 'get multiple element handle');
	});

	it('generate correct ws message for requesting element attributes', () => {
		assert.deepStrictEqual(toJSON({
			selector: {active: true},
			attributes: [],
		}), {
			subject: {
				type: 'elementAttributes',
				attributes: [],
				selector: {
					active: true,
				},
			},
			type: 'query',
		}, 'get all element attributes');
		assert.deepStrictEqual(toJSON({
			selector: {active: true},
			attributes: ['id', 'class'],
		}), {
			subject: {
				type: 'elementAttributes',
				attributes: ['id', 'class'],
				selector: {
					active: true,
				},
			},
			type: 'query',
		}, 'get several element attributes');
	});

	it('generate correct ws message for requesting element css properties', () => {
		assert.deepStrictEqual(toJSON({
			selector: {active: true},
			cssProps: ['height', 'width'],
		}), {
			subject: {
				type: 'elementCssProps',
				elementCssProps: ['height', 'width'],
				selector: {
					active: true,
				},
			},
			type: 'query',
		}, 'get element css properties');
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(element, ['']);
		testInputErrorSync(element, [{'noRequiredSelector': true}]);
		testInputErrorSync(element, [[{}]]);
		testInputErrorSync(element, [[{'noRequiredSelector': true}]]);
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
