const assert = require('assert');
const {
	window,
	windowAssert,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/windowChain');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');

function testAllowedModifiers(chain) {
	// general
	assert.strictEqual(typeof chain.clone, 'function');
	assert.strictEqual(typeof chain.abandon, 'function');
	assert.strictEqual(typeof chain.toString, 'function');
	assert.strictEqual(typeof chain.toJSON, 'function');
	assert.strictEqual(typeof chain.then, 'function');
	assert.strictEqual(typeof chain.toAssert, 'function');
	// repeat, interval
	assert.strictEqual(typeof chain.repeat, 'undefined');
	assert.strictEqual(typeof chain.interval, 'undefined');
	// one of
	assert.strictEqual(typeof chain.sendText, 'undefined');
	assert.strictEqual(typeof chain.refresh, 'undefined');
	assert.strictEqual(typeof chain.goBack, 'undefined');
	assert.strictEqual(typeof chain.goForward, 'undefined');
	assert.strictEqual(typeof chain.setSize, 'undefined');
	assert.strictEqual(typeof chain.dismissModal, 'undefined');
	assert.strictEqual(typeof chain.acceptModal, 'undefined');
}

/**
 * This test is sort of high level, more like integration test
 * however it's compliant to BDD principles because of this.
 * We don't care about implementation details, we need code to do what we want
 */
describe('Window chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = window();

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.toJSON, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.sendText, 'function');
		assert.strictEqual(typeof chain.refresh, 'function');
		assert.strictEqual(typeof chain.goBack, 'function');
		assert.strictEqual(typeof chain.goForward, 'function');
		assert.strictEqual(typeof chain.setSize, 'function');
		assert.strictEqual(typeof chain.dismissModal, 'function');
		assert.strictEqual(typeof chain.acceptModal, 'function');
		assert.strictEqual(typeof chain.toAssert, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after sendText is applied', () => {
		function testWindowSendTextModifiers(chain) {
			assert.strictEqual(typeof chain.clone, 'function');
			assert.strictEqual(typeof chain.abandon, 'function');
			assert.strictEqual(typeof chain.toString, 'function');
			assert.strictEqual(typeof chain.toJSON, 'function');
			assert.strictEqual(typeof chain.then, 'function');
			assert.strictEqual(typeof chain.repeat, 'function');
			assert.strictEqual(typeof chain.interval, 'function');
			assert.strictEqual(typeof chain.sendText, 'undefined');
			assert.strictEqual(typeof chain.refresh, 'undefined');
			assert.strictEqual(typeof chain.goBack, 'undefined');
			assert.strictEqual(typeof chain.goForward, 'undefined');
			assert.strictEqual(typeof chain.setSize, 'undefined');
			assert.strictEqual(typeof chain.dismissModal, 'undefined');
			assert.strictEqual(typeof chain.acceptModal, 'undefined');
		}

		it('with empty string as a value', () => {
			testWindowSendTextModifiers(window().sendText(''));
		});

		it('with not empty string as a value', () => {
			testWindowSendTextModifiers(window().sendText('text'));
		});
	});

	it('should have only allowed modifiers after other modifiers are applied', () => {
		testAllowedModifiers(window().refresh());
		testAllowedModifiers(window().goBack());
		testAllowedModifiers(window().goForward());
		testAllowedModifiers(window().setSize(1, 1));
		testAllowedModifiers(window().dismissModal());
		testAllowedModifiers(window().acceptModal());
	});

	it('should have only allowed modifiers after abandon is applied', () => {
		const chain = window().abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
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

		assert.strictEqual(window().toString(), 'Window chain');
		assert.strictEqual(window().sendText('').toString(), 'Sending text "" to window, repeat 1 times every 1 ms');
		assert.strictEqual(
			window().sendText('text string').toString(),
			'Sending text "text string" to window, repeat 1 times every 1 ms'
		);
		assert.strictEqual(
			window().sendText('text string').repeat(3).toString(),
			'Sending text "text string" to window, repeat 3 times every 1 ms'
		);
		assert.strictEqual(
			window().sendText('text string').interval(3000).toString(),
			'Sending text "text string" to window, repeat 1 times every 3000 ms'
		);
		assert.strictEqual(
			window().sendText('text string').interval(3000).repeat(2).toString(),
			'Sending text "text string" to window, repeat 2 times every 3000 ms'
		);
		assert.strictEqual(
			window().sendText('text string').interval(3000).repeat(2).until(untilData).toString(),
			'Sending text "text string" to window, repeat 2 times every 3000 ms'
		);
		assert.strictEqual(
			window().sendText('text string').until(untilData).toString(),
			'Sending text "text string" to window, repeat 1 times every 1 ms'
		);
		assert.strictEqual(
			window().sendText('text string').repeat(3).interval(4000).toString(),
			'Sending text "text string" to window, repeat 3 times every 4000 ms'
		);
		assert.strictEqual(
			window().sendText('text string').repeat(1).interval(1).toString(),
			'Sending text "text string" to window, repeat 1 times every 1 ms'
		);
		assert.strictEqual(
			window().sendText('text string').repeat(3).interval(4000).until(untilData).toString(),
			'Sending text "text string" to window, repeat 3 times every 4000 ms'
		);
		assert.strictEqual(window().refresh('').toString(), 'Refreshing browser page');
		assert.strictEqual(window().goBack('').toString(), 'Navigating back in browser history');
		assert.strictEqual(window().goForward('').toString(), 'Navigating forward in browser history');
		assert.strictEqual(window().dismissModal('').toString(), 'Dismissing modal dialog');
		assert.strictEqual(window().acceptModal().toString(), 'Accepting modal dialog');
		assert.strictEqual(window().acceptModal('text').toString(), 'Accepting modal dialog with \'text\' message');
		assert.strictEqual(window().setSize(10, 20).toString(), 'Setting browser window size to 10, 20');
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');
		const beforeSendMsgContains = assertBeforeSendMsg(beforeSendMsg, log);

		beforeSendMsgContains(
			{sendText: 'text'},
			'Launcher E Sending text "text" to window, repeat 1 times every 1 ms'
		);
		beforeSendMsgContains(
			{sendText: ''},
			'Launcher E Sending text "" to window, repeat 1 times every 1 ms'
		);
		beforeSendMsgContains(
			{sendText: 'assered text', isAssert: true},
			'Launcher A Sending text "assered text" to window, repeat 1 times every 1 ms'
		);
		log.restore();
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {type: void 0},
			},
		}, 'type testLine browserCommand');
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
		}, 'type testLine sendText with empty string');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			sendText: 'text',
			repeat: 2,
			interval: 2000,
		}), {
			type: 'testLine',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 2,
				delay: 2000,
				val: 'text',
			},
		}, 'type testLine sendText');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			sendText: 'text',
			repeat: 2,
			interval: 2000,
			until: 'testCondition',
		}), {
			type: 'testLine',
			request: {
				type: 'sendText',
				target: {type: 'window'},
				count: 2,
				delay: 2000,
				val: 'text',
				condition: 'testCondition',
			},
		}, 'type testLine sendText  until');
		assert.deepStrictEqual(toJSON({
			isRefresh: true,
		}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {type: 'refresh'},
			},
		}, 'type eval refresh');
		assert.deepStrictEqual(toJSON({
			isSetSize: true,
			width: 100,
			height: 200,
		}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {
					type: 'setWindowSize',
					params: {
						width: 100,
						height: 200,
					},
				},
			},
		}, 'type eval set size');
		assert.deepStrictEqual(toJSON({
			isAcceptModal: true,
		}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {type: 'acceptAlertMessage'},
			},
		}, 'type eval accept modal without message');
		assert.deepStrictEqual(toJSON({
			isAcceptModal: true,
			acceptModalMessage: 'text',
		}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {
					type: 'acceptPromptMessage',
					params: {text: 'text'},
				},
			},
		}, 'type eval accept modal with message');
		assert.deepStrictEqual(toJSON({
			isDismissModal: true,
		}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {type: 'dismissAlertMessage'},
			},
		}, 'type eval dismiss modal');
		assert.deepStrictEqual(toJSON({
			isGoBack: true,
		}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {type: 'goBack'},
			},
		}, 'type eval, go back thought navigation history');
		assert.deepStrictEqual(toJSON({
			isGoForward: true,
		}), {
			type: 'eval',
			request: {
				type: 'browserCommand',
				browserCommand: {type: 'goForward'},
			},
		}, 'type eval, go forward thought navigation history');
	});

	it('should define assert function', () => {
		const chain = windowAssert();

		assert.strictEqual('toAssert' in chain, false);
	});
});
