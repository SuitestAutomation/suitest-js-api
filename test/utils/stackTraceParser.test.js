const assert = require('assert');
const stackTraceParser = require('../../lib/utils/stackTraceParser');

describe('stackTraceParser util', () => {
	it('test fetchSource', () => {
		const {fetchSource} = stackTraceParser;
		const error = new Error();

		assert(Array.isArray(fetchSource(error)));
		assert(fetchSource(error).length > 0);
		assert(fetchSource(error, 1).length === 3);
		assert(fetchSource(error, 2).length === 5);
		assert(fetchSource(error, 3).length === 7);
		assert(fetchSource(error, -1).length === 0);
		assert(fetchSource(error, -3).length === 0);
		assert(fetchSource(error, 'there are should be number').length === 0);
		assert(fetchSource(error, NaN).length === 0);
		assert(fetchSource(error, null).length === 1);
	});

	it('test stackTraceParser', () => {
		const {stackTraceParser: parser} = stackTraceParser;
		const error = new Error();

		assert(parser(error).length > 0);
		assert(parser(null).length > 0);
		assert(parser(NaN).length > 0);
		assert(parser().length > 0);
		assert(parser({}).length === 0);
		assert(parser('some string').length ===0);
		assert(parser(123123).length === 0);
		assert(parser([]).length === 0);
		assert(parser(() => { /**/ }).length === 0);
	});

	it('test prependStack', () => {
		const error = {};
		const stack = 'title1\nat test.test (test.js:1:1)\nat test.test (test.js:2:2)';

		error.stack = stack;
		assert.equal(
			stackTraceParser.prependStack(error, 'title2\nat test.test (test.js:0:0)').stack,
			'title1\nat test.test (test.js:0:0)\nat test.test (test.js:1:1)\nat test.test (test.js:2:2)',
			'prepended',
		);

		error.stack = stack;
		assert.equal(
			stackTraceParser.prependStack(error, 'title2\nat test.test (test.js:1:1)').stack,
			stack,
			'not changed, lines duplicated',
		);
	});

	it('test isStackLine', () => {
		assert.strictEqual(stackTraceParser.isStackLine('at something'), true);
		assert.strictEqual(stackTraceParser.isStackLine('\tat something\n'), true);
		assert.strictEqual(stackTraceParser.isStackLine('something'), false);
		assert.strictEqual(stackTraceParser.isStackLine('something at something'), false);
	});

	it('test getFirstStackLine', () => {
		assert.strictEqual(stackTraceParser.getFirstStackLine('Some Error:\n\tat line1\n\tat line2'), '\tat line1');
		assert.strictEqual(stackTraceParser.getFirstStackLine('\tat line1\n\tat line2'), '\tat line1');
	});
});
