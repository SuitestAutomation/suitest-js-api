const assert = require('assert');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');
const {
	jsExpression,
	jsExpressionAssert,
	toJSON,
} = require('../../lib/chains/javascriptExpressionChain');
const SuitestError = require('../../lib/utils/SuitestError');
const {SUBJ_COMPARATOR} = require('../../lib/mappings');
const comparatorTypes = require('../../lib/constants/comparator');

describe('Location chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = jsExpression('1+1');

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
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

	it('should convert to string with meaningful message', () => {
		assert.equal(jsExpression('1+1').toString(), 'Get result of JavaScript expression');
		assert.equal(jsExpression('1+1').equal('test').toString(), 'Check if JavaScript expression equals test');
		assert.equal(
			jsExpression('1+1').doesNot().startWith('test').toString(),
			'Check if JavaScript expression does not start with test'
		);
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

	it('should throw error in case of invalid input', async() => {
		jsExpression(function() {
			return 1 + 1;
		});
		assert.ok(true, 'no error');

		await assertThrowsAsync(jsExpression.bind(null, undefined), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if undefined');

		await assertThrowsAsync(jsExpression.bind(null, 1), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if 1');

		await assertThrowsAsync(jsExpression.bind(null, ''), {
			type: 'SuitestError',
			code: SuitestError.INVALID_INPUT,
		}, 'invalid error if ""');

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
