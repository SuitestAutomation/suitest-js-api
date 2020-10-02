const fs = require('fs');
const assert = require('assert');
const sinon = require('sinon');
const {processServerResponse} = require('../../lib/utils/socketChainHelper');
const {getTimeoutValue} = require('../../lib/utils/chainUtils');
const suitest = require('../../index');
const SuitestError = require('../../lib/utils/SuitestError');
const helpers = require('../../lib/utils/socketChainHelper');
const {SUBJ_COMPARATOR} = require('../../lib/mappings');
const {toString: elementToString} = require('../../lib/chains/elementChain')(suitest, suitest.video);
const {logger} = suitest;

describe('socket chain helpers', () => {
	before(() => {
		sinon.stub(console, 'error'); // prevent console error logs
	});
	after(() => {
		console.error.restore();
	});

	it('should provide a method to get user defined or default timeout out of data', () => {
		assert.strictEqual(getTimeoutValue({}, 2000), 2000, 'default value');
		assert.strictEqual(getTimeoutValue({timeout: 1000}, 2000), 1000, 'user value');
	});

	it('should provide a method to handle server chain web sockets response', () => {
		const chain = {
			type: 'query',
			subject: {
				type: 'location,',
			},
		};

		// query
		assert.throws(() => processServerResponse(logger, 'verbose')({
			contentType: 'query',
		}, {stack: ''}, chain), SuitestError, 'query fail');
		assert.strictEqual(processServerResponse(logger, 'verbose')({
			contentType: 'query',
			cookieExists: true,
		}, {stack: ''}, chain), true, 'query cookie exists');
		assert.strictEqual(processServerResponse(logger, 'verbose')({
			contentType: 'query',
			elementExists: false,
		}, {stack: ''}, chain), undefined, 'query element not found');
		// eval
		assert.strictEqual(processServerResponse(logger, 'verbose')({
			contentType: 'eval',
			result: 'success',
			errorType: 'error',
		}, {stack: ''}, chain), true, 'evals success');
		assert.strictEqual(processServerResponse(logger, 'verbose')({
			contentType: 'eval',
			result: 'fail',
			errorType: 'queryFailed',
		}, {stack: ''}, chain), false, 'eval fail');
		// test line
		assert.strictEqual(processServerResponse(logger, 'verbose')({
			contentType: 'testLine',
			result: 'success',
		}, {stack: ''}, chain), undefined, 'testLine success');
		// all other
		assert.throws(() => processServerResponse(logger, 'verbose')({
			result: 'fail',
		}, {stack: ''}, chain), Error, 'testLine fail');
		assert.throws(() => processServerResponse(logger, 'verbose')({
			result: 'error',
		}, {stack: ''}, chain), Error, 'testLine fail');
		// execution error
		assert.throws(() => processServerResponse(logger, 'verbose')({
			executionError: 'appNotRunning',
		}, {stack: ''}, chain), Error, 'execution error');

		assert.throws(
			() => processServerResponse(logger, 'verbose')({
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
			}, {
				type: 'eval',
				request: {
					type: 'setText',
					target: {
						type: 'element',
						val: {
							css: 'test',
						},
					},
					val: 'set text value',
				},
			})
		);

		assert.throws(
			() => processServerResponse(logger, elementToString)({
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
			}, {
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'element',
							val: {
								css: 'body',
							},
						},
						type: 'has',
						expression: [
							{
								property: 'height',
								type: '=',
								val: 100,
							},
						],
					},
					timeout: 2000,
				},
			}),
			err => err instanceof assert.AssertionError
		);

		assert.throws(
			() => processServerResponse(logger, 'verbose')(
				{
					result: 'fail',
					errorType: 'queryFailed',
					actualValue: 'http://url/index-hbbtv.html',
					expectedValue: 'test',
					contentType: 'testLine',
				},
				{stack: ''},
				chain,
			),
			err => err instanceof assert.AssertionError
		);

		assert.throws(
			() => processServerResponse(logger, 'verbose')(
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
				{
					type: 'testLine',
					request: {
						type: 'assert',
						condition: {
							subject: {
								type: 'element',
								val: {
									css: 'body',
								},
							},
							type: 'has',
							expression: [
								{
									property: 'height',
									type: '=',
									val: 100,
								},
								{
									property: 'width',
									type: '=',
									val: 200,
								},
							],
						},
						timeout: 2000,
					},
				},
			),
			err => err instanceof assert.AssertionError,
		);

		assert.throws(
			() => processServerResponse(logger, 'verbose')(
				{
					result: 'fail',
					expression: [
						{
							result: 'fail',
							errorType: 'queryFailed',
							message: {
								code: 'missingProperty',
								info: {},
							},
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
										name: 'visibility',
										val: 'invisible',
										type: '=',
										deviation: undefined,
									},
								],
						},
					isAssert: true,
					stack: '',
				},
				{
					type: 'testLine',
					request: {
						type: 'assert',
						condition: {
							subject: {
								type: 'element',
								val: {
									css: 'body',
								},
							},
							type: 'has',
							expression: [
								{
									property: 'visibility',
									type: '=',
									val: 'invisible',
								},
							],
						},
						timeout: 2000,
					},
				},
			),
			err => err instanceof assert.AssertionError
		);

		assert.throws(
			() => processServerResponse(logger, 'verbose')(
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
									type: '=',
									val: 100,
								},
							],
					},
					isAssert: true,
					stack: '',
					isClick: true,
				},
				{
					type: 'testLine',
					request: {
						type: 'assert',
						condition: {
							subject: {
								type: 'element',
								val: {
									css: 'body',
								},
							},
							type: 'has',
							expression: [
								{
									property: 'visibility',
									type: '=',
									val: 'invisible',
								},
							],
						},
						timeout: 2000,
					},
				},
			),
			err => err instanceof assert.AssertionError
		);

		sinon.stub(logger, 'warn');

		try {
			assert.strictEqual(processServerResponse(logger, 'verbose')({
				contentType: 'eval',
				result: 'warning',
				errorType: 'error',
			}, {stack: ''}, chain), true, 'eval warning');
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
			assert.strictEqual(helpers.getRequestType({}, false), 'eval');
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

	it('Handle processed message for saveScreenshot line', async() => {
		const writeFileStub = sinon.stub(fs.promises, 'writeFile');

		const res = await processServerResponse(() => '')({
			contentType: 'takeScreenshot',
			result: 'success',
			buffer: Buffer.from([1, 2, 3]),
		}, {
			type: 'takeScreenshot',
			stack: '',
			fileName: '/path/to/file.png',
		}, {
			type: 'takeScreenshot',
		});

		try {
			assert.strictEqual(res, undefined);
			assert.deepStrictEqual(
				writeFileStub.firstCall.args,
				['/path/to/file.png', Buffer.from([1, 2, 3])]
			);
		} finally {
			writeFileStub.restore();
		}
	});
});
