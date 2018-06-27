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
		}, {stack: ''}), false, 'query element not found');
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
				stack: '',
			}),
			err => err instanceof assert.AssertionError
		);

		assert.throws(
			() => helpers.processServerResponse(emptyString)(
				{
					result: 'fail',
					errorType: 'queryFailed',
					actualValue: 'http://bxdpm12o-0-staging.suitest.net/sampleapp_staging/index-hbbtv.html',
					expectedValue: 'test',
					contentType: 'testLine',
				},
				{stack: ''},
			),
			err => err instanceof assert.AssertionError &&
				err.actual === 'http://bxdpm12o-0-staging.suitest.net/sampleapp_staging/index-hbbtv.html' &&
				err.expected === 'test',
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
					stack: '',
				},
			),
			err => err instanceof assert.AssertionError &&
				err.actual === `height: 720${EOL}width: 1282` &&
				err.expected === `height: 100${EOL}width: 200`
		);

		assert.throws(
			() => helpers.processServerResponse(() => '')(
				{result: 'fatal'}, {stack: ''}
			), err => err.message.includes('Fatal'),
			'Fatal error thrown correctly'
		);
	});
});
