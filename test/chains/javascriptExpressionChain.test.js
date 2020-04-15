const assert = require('assert');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const suitest = require('../../index');
const {
	jsExpression,
	jsExpressionAssert,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/javascriptExpressionChain')(suitest);
const {SUBJ_COMPARATOR} = require('../../lib/mappings');
const comparatorTypes = require('../../lib/constants/comparator');
const sinon = require('sinon');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');

describe('JavaScript expression chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = jsExpression('1+1');

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');
		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');
		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');
		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.toAssert, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after condition started', () => {
		const chain = jsExpression('1+1').equal('http://suite.st');

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.equal, 'undefined');
		assert.strictEqual(typeof chain.equals, 'undefined');
		assert.strictEqual(typeof chain.contain, 'undefined');
		assert.strictEqual(typeof chain.contains, 'undefined');
		assert.strictEqual(typeof chain.startWith, 'undefined');
		assert.strictEqual(typeof chain.startsWith, 'undefined');
		assert.strictEqual(typeof chain.endWith, 'undefined');
		assert.strictEqual(typeof chain.endsWith, 'undefined');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.then, 'function');
	});

	it('should have only allowed modifiers after timeout is set', () => {
		const chain = jsExpression('1+1').timeout(1000);

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.timeout, 'undefined');
		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');
		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');
		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');
		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.then, 'function');
	});

	it('should have only allowed modifiers after it is nagated', () => {
		const chain = jsExpression('1+1').not();

		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');
		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');
		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');
		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.then, 'function');
	});

	it('abandon method should not be allowed after calling it', () => {
		const chain = jsExpression('1 + 1').abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(jsExpression('1+1').toString(), 'Evaluating JS:\n1+1');
		assert.equal(
			jsExpression('1+1').equal('test').toString(),
			'Check if JS expression\n' +
			'1+1\n' +
			'equals string "test"'
		);
		assert.equal(
			jsExpression('1+1').doesNot().startWith('test').toString(),
			'Check if JS expression\n' +
			'1+1\n' +
			'does not start with string "test"'
		);
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');
		const beforeSendMsgContains = assertBeforeSendMsg(beforeSendMsg, log);

		beforeSendMsgContains({expression: '1+1'}, 'Launcher E Evaluating JS:');
		beforeSendMsgContains({
			isNegated: true,
			expression: '1+1',
			comparator: {
				type: comparatorTypes.EQUAL,
				val: '2',
			},
		}, 'Launcher E Check if JS expression');
		beforeSendMsgContains({
			isAssert: true,
			isNegated: true,
			expression: '1+1',
			comparator: {
				type: comparatorTypes.EQUAL,
				val: '2',
			},
		}, 'Launcher A Check if JS expression');

		beforeSendMsg('1+1');
		assert.ok(log.firstCall.args[0], 'beforeSendMsg exists');
		log.restore();
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			expression: '1+1',
		}), {
			type: 'query',
			subject: {
				type: 'execute',
				execute: '1+1',
			},
		}, 'chain query');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			isNegated: true,
			expression: '1+1',
			comparator: {
				type: comparatorTypes.EQUAL,
				val: '2',
			},
		}), {
			type: 'testLine',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'javascript',
						val: '1+1',
					},
					type: '!' + SUBJ_COMPARATOR[comparatorTypes.EQUAL],
					val: '2',
				},
				timeout: 2000,
			},
		}, 'chain wait until testLine');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			timeout: 0,
			expression: '1+1',
			comparator: {
				type: comparatorTypes.START_WITH,
				val: '2',
			},
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'javascript',
						val: '1+1',
					},
					type: SUBJ_COMPARATOR[comparatorTypes.START_WITH],
					val: '2',
				},
			},
		}, 'chain assert testLine');
		assert.deepStrictEqual(toJSON({
			timeout: 2000,
			expression: '1+1',
			comparator: {
				type: comparatorTypes.START_WITH,
				val: '2',
			},
		}), {
			type: 'eval',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'javascript',
						val: '1+1',
					},
					type: SUBJ_COMPARATOR[comparatorTypes.START_WITH],
					val: '2',
				},
				timeout: 2000,
			},
		}, 'chain eval');
	});

	it('should throw error in case of invalid input', () => {
		jsExpression(function() {
			return 1 + 1;
		});
		assert.ok(true, 'no error');

		testInputErrorSync(jsExpression, []);
		testInputErrorSync(jsExpression, [1]);
		testInputErrorSync(jsExpression, ['']);
		testInputErrorSync(toJSON, [{
			isAssert: true,
			timeout: 0,
			expression: '1+1',
		}]);
	});

	it('should define assert function', () => {
		const chain = jsExpressionAssert('1+1');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
