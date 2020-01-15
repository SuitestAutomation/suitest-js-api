const assert = require('assert');
const sinon = require('sinon');
const helpers = require('../../lib/utils/socketChainHelper');
const logger = require('../../lib/utils/logger');
const SuitestError = require('../../lib/utils/SuitestError');
const {SUBJ_COMPARATOR} = require('../../lib/mappings');
const {toString: elementToString} = require('../../lib/chains/elementChain');

describe('socket chain helpers', () => {
	before(() => {
		sinon.stub(console, 'error'); // prevent console error logs
	});
	after(() => {
		console.error.restore();
	});

	it('should provide a method to get user defined or default timeout out of data', () => {
		assert.strictEqual(helpers.getTimeoutValue({}), 2000, 'default value');
		assert.strictEqual(helpers.getTimeoutValue({timeout: 1000}), 1000, 'user value');
	});

	it('should provide a method to handle server chain web sockets response', () => {
		const emptyString = () => '';

		// query
		assert.throws(() => helpers.processServerResponse(emptyString)({
			contentType: 'query',
		}, {stack: ''}), SuitestError, 'query fail');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			cookieExists: true,
		}, {stack: ''}), true, 'query cookie exists');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			cookieValue: 'cookie',
		}, {stack: ''}), 'cookie', 'query cookie value');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			elementProps: 'props',
		}, {stack: ''}), 'props', 'query element props');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			elementExists: false,
		}, {stack: ''}), undefined, 'query element not found');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'query',
			execute: 'val',
		}, {stack: ''}), 'val', 'query js expression');
		// eval
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'eval',
			result: 'success',
			errorType: 'error',
		}, {stack: ''}), true, 'evals success');
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'eval',
			result: 'fail',
			errorType: 'queryFailed',
		}, {stack: ''}), false, 'eval fail');
		// test line
		assert.strictEqual(helpers.processServerResponse(emptyString)({
			contentType: 'testLine',
			result: 'success',
		}, {stack: ''}), undefined, 'testLine success');
		assert.throws(() => helpers.processServerResponse(emptyString)({
			contentType: 'testLine',
			result: 'fail',
			errorType: 'queryFailed',
		}, {stack: ''}), assert.AssertionError, 'testLine fail');
		assert.throws(() => helpers.processServerResponse(emptyString)({
			contentType: 'testLine',
			result: 'fail',
			errorType: 'queryFailed',
			errors: {},
		}, {stack: ''}), assert.AssertionError, 'testLine fail');
		// all other
		assert.throws(() => helpers.processServerResponse(emptyString)({
			result: 'fail',
		}, {stack: ''}), Error, 'testLine fail');
		assert.throws(() => helpers.processServerResponse(emptyString)({
			result: 'error',
		}, {stack: ''}), Error, 'testLine fail');
		// execution error
		assert.throws(() => helpers.processServerResponse(emptyString)({
			executionError: 'appNotRunning',
		}, {stack: ''}), Error, 'execution error');

		assert.throws(
			() => helpers.processServerResponse(emptyString)({
				contentType: 'eval',
				result: 'fail',
				errorType: 'invalidInput',
				message: {
					code: 'elementNotSupported',
				},
			}, {
				stack: '',
				type: 'element',
				selector: {css: 'body'},
				setText: 'simple text',
			}),
			new SuitestError(
				'. .setText() is unsupported by this element.',
				SuitestError.EVALUATION_ERROR,
				{errorType: 'invalidInput', message: {code: 'elementNotSupported'}}
			)
		);

		assert.throws(
			() => helpers.processServerResponse(elementToString)({
				errorType: 'queryFailed',
				result: 'error',
				contentType: 'testLine',
			}, {
				type: 'element',
				selector: {css: 'body'},
				comparator: {
					type: 'has',
					props: [
						{
							name: 'height',
							val: 100,
							type: '=',
							deviation: undefined,
						},
					],
				},
				isAssert: true,
				stack: '',
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
				{stack: ''},
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
							type: 'has',
							props:
								[
									{
										name: 'height',
										val: 100,
										type: '=',
										deviation: undefined,
									},
									{
										name: 'width',
										val: 200,
										type: '=',
										deviation: undefined,
									},
								],
						},
					isAssert: true,
					stack: '',
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
					stack: '',
				},
			),
			err => err instanceof assert.AssertionError &&
				err.message.includes('× prop: 200 (actual)') &&
				err.message.includes('~ prop: 100 (expected)'),
		);

		assert.throws(
			() => helpers.processServerResponse(() => '')(
				{result: 'fatal'}, {stack: ''}
			), err => err.message.includes('Fatal'),
			'Fatal error thrown correctly'
		);

		sinon.stub(logger, 'warn');

		try {
			assert.strictEqual(helpers.processServerResponse(emptyString)({
				contentType: 'eval',
				result: 'warning',
				errorType: 'error',
			}, {stack: ''}), true, 'eval warning');
			assert.strictEqual(logger.warn.called, true, 'warning bumped');
		} finally {
			logger.warn.restore();
		}
	});

	describe('testing getRequestType helper', () => {
		it('should return testLine type', () => {
			assert.strictEqual(
				helpers.getRequestType({isAssert: true}),
				'testLine'
			);
			assert.strictEqual(
				helpers.getRequestType({
					isAssert: true,
					comparator: '=',
					isClick: true,
					isMoveTo: true,
					setText: '',
					sendText: 'text',
				}),
				'testLine'
			);
		});

		it('should return eval type', () => {
			assert.strictEqual(helpers.getRequestType({}, false), 'eval')
			assert.strictEqual(helpers.getRequestType({comparator: '='}), 'eval');
			assert.strictEqual(helpers.getRequestType({isClick: true}), 'eval');
			assert.strictEqual(helpers.getRequestType({isMoveTo: true}), 'eval');
			assert.strictEqual(helpers.getRequestType({setText: 'text'}), 'eval');
			assert.strictEqual(helpers.getRequestType({setText: ''}), 'eval');
			assert.strictEqual(helpers.getRequestType({sendText: 'text'}), 'eval');
			assert.strictEqual(helpers.getRequestType({sendText: ''}), 'eval');
		});

		it('should return query type', () => {
			assert.strictEqual(helpers.getRequestType({}), 'query');
		});
	});
});
