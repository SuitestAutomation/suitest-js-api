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
});
