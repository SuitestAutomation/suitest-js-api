const assert = require('assert');
const {EOL} = require('os');
const helpers = require('../../lib/utils/socketChainHelper');
const SuitestError = require('../../lib/utils/SuitestError');
const {PROP_COMPARATOR, SUBJ_COMPARATOR, ELEMENT_PROP} = require('../../lib/mappings');
const {toString: elementToString} = require('../../lib/chains/elementChain');
const sinon = require('sinon');

describe('socket chain helpers', () => {
	it('should provide a method to get user defined or default timeout out of data', () => {
		assert.strictEqual(helpers.getTimeoutValue({}), 2000, 'default value');
		assert.strictEqual(helpers.getTimeoutValue({timeout: 1000}), 1000, 'user value');
	});

	it('shouldv provide a method to handle server chain web sockets response', () => {
		const emptyString = () => '';

		// query
		assert.throws(() => helpers.processServerResponse(emptyString)({
			contentType: 'query',
		}), SuitestError, 'query fail');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			cookieExists: true,
		}), true, 'query cookie exists');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			cookieValue: 'cookie',
		}), 'cookie', 'query cookie value');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			elementProps: 'props',
		}), 'props', 'query element props');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			elementExists: false,
		}), false, 'query element not found');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			execute: 'val',
		}), 'val', 'query js expression');
		// eval
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'eval',
			result: 'success',
			errorType: 'error',
		}), true, 'evals success');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'eval',
			result: 'fail',
			errorType: 'queryFailed',
		}, {}), false, 'eval fail');
		// test line
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'testLine',
			result: 'success',
		}), undefined, 'testLine success');
		assert.throws(() => helpers.processServerResponse(emptyString)({
			contentType: 'testLine',
			result: 'fail',
			errorType: 'queryFailed',
		}, {}), assert.AssertionError, 'testLine fail');
		assert.throws(() => helpers.processServerResponse(emptyString)({
			contentType: 'testLine',
			result: 'fail',
			errorType: 'queryFailed',
			errors: {},
		}, {}), assert.AssertionError, 'testLine fail');
		// all other
		assert.throws(() => helpers.processServerResponse(emptyString)({
			result: 'fail',
		}), Error, 'testLine fail');
		assert.throws(() => helpers.processServerResponse(emptyString)({
			result: 'error',
		}), Error, 'testLine fail');

		assert.throws(
			() => helpers.processServerResponse(elementToString)({
				errorType: 'queryFailed',
				result: 'error',
				contentType: 'testLine',
			}, {
				type: 'element',
				selector: {css: 'body'},
				comparator: {
					type: SUBJ_COMPARATOR['has'],
					props: [
						{
							name: ELEMENT_PROP['height'],
							val: 100,
							type: PROP_COMPARATOR['='],
							deviation: undefined,
						},
					],
				},
				isAssert: true,
			}),
			err => err instanceof assert.AssertionError
		);

		assert.throws(
			() => helpers.processServerResponse(emptyString)(
				{
					result: 'fail',
					errorType: 'queryFailed',
					actualValue: 'http://url/index-hbbtv.html',
					expectedValue: 'test',
					contentType: 'testLine',
				},
				{},
			),
			err => err instanceof assert.AssertionError &&
				err.message.includes('× http://url/index-hbbtv.html (actual)') &&
				err.message.includes('~ test (expected)')
		);

		assert.throws(
			() => helpers.processServerResponse(emptyString)(
				{
					result: 'fail',
					expression: [
						{
							result: 'fail',
							errorType: 'queryFailed',
							actualValue: 720,
							expectedValue: 100,
						},
						{
							result: 'fail',
							errorType: 'queryFailed',
							actualValue: 1282,
							expectedValue: 200,
						},
					],
					errorType: 'queryFailed',
					contentType: 'testLine',
				},
				{
					type: 'element',
					selector: {css: 'body'},
					comparator:
						{
							type: SUBJ_COMPARATOR['has'],
							props:
								[
									{
										name: ELEMENT_PROP['height'],
										val: 100,
										type: PROP_COMPARATOR['='],
										deviation: undefined,
									},
									{
										name: ELEMENT_PROP['width'],
										val: 200,
										type: PROP_COMPARATOR['='],
										deviation: undefined,
									},
								],
						},
					isAssert: true,
				},
			),
			err => err instanceof assert.AssertionError &&
				err.message.includes('× height: 720 (actual)') &&
				err.message.includes('~ height: 100 (expected)') &&
				err.message.includes('× width: 1282 (actual)') &&
				err.message.includes('~ width: 200 (expected)')
		);

		assert.throws(
			() => helpers.processServerResponse(emptyString)(
				{
					result: 'fail',
					expression: [{
						result: 'fail',
						errorType: 'queryFailed',
						actualValue: 200,
						expectedValue: 100,
					}],
					errorType: 'queryFailed',
					contentType: 'testLine',
				},
				{
					type: 'element',
					selector: {css: 'body'},
					until: {
						type: SUBJ_COMPARATOR['has'],
						expression:
							[
								{
									property: 'prop',
									val: 100,
								},
							],
					},
					isAssert: true,
				},
			),
			err => err instanceof assert.AssertionError &&
				err.message.includes('× prop: 200 (actual)') &&
				err.message.includes('~ prop: 100 (expected)'),
		);
	});

	it('should exit process when response result is fatal', () => {
		sinon.stub(console, 'error');
		sinon.stub(process, 'exit');

		try {
			helpers.processServerResponse(() => '')({result: 'fatal'}, {}),
			assert(console.error.called);
			assert(process.exit.calledWith(1));
			assert(process.exit.called);
		} finally {
			console.error.restore();
			process.exit.restore();
		}
	});
});
