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
		const emptyString = () => '';

		// query
		assert.throws(() => processServerResponse(logger, emptyString)({
			contentType: 'query',
		}, {stack: ''}, {}), SuitestError, 'query fail');
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'query',
			cookieExists: true,
		}, {stack: ''}, {}), true, 'query cookie exists');
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'query',
			cookieValue: 'cookie',
		}, {stack: ''}, {}), 'cookie', 'query cookie value');
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'query',
			elementProps: 'props',
		}, {stack: ''}, {}), 'props', 'query element props');
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'query',
			elementExists: false,
		}, {stack: ''}, {}), undefined, 'query element not found');
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'query',
			execute: 'val',
		}, {stack: ''}, {}), 'val', 'query js expression');
		// eval
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'eval',
			result: 'success',
			errorType: 'error',
		}, {stack: ''}, {}), true, 'evals success');
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'eval',
			result: 'fail',
			errorType: 'queryFailed',
		}, {stack: ''}, {}), false, 'eval fail');
		// test line
		assert.strictEqual(processServerResponse(logger, emptyString)({
			contentType: 'testLine',
			result: 'success',
		}, {stack: ''}, {}), undefined, 'testLine success');
		assert.throws(() => processServerResponse(logger, emptyString)({
			contentType: 'testLine',
			result: 'fail',
			errorType: 'queryFailed',
		}, {stack: ''}, {}), assert.AssertionError, 'testLine fail');
		assert.throws(() => processServerResponse(logger, emptyString)({
			contentType: 'testLine',
			result: 'fail',
			errorType: 'queryFailed',
			errors: {},
		}, {stack: ''}, {}), assert.AssertionError, 'testLine fail');
		// all other
		assert.throws(() => processServerResponse(logger, emptyString)({
			result: 'fail',
		}, {stack: ''}, {}), Error, 'testLine fail');
		assert.throws(() => processServerResponse(logger, emptyString)({
			result: 'error',
		}, {stack: ''}, {}), Error, 'testLine fail');
		// execution error
		assert.throws(() => processServerResponse(logger, emptyString)({
			executionError: 'appNotRunning',
		}, {stack: ''}, {}), Error, 'execution error');

		assert.throws(
			() => processServerResponse(logger, emptyString)({
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
			}),
			new SuitestError(
				'. .setText() is unsupported by this element.',
				SuitestError.EVALUATION_ERROR,
				{errorType: 'invalidInput', message: {code: 'elementNotSupported'}},
			),
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
			err => err instanceof assert.AssertionError,
		);

		assert.throws(
			() => processServerResponse(logger, emptyString)(
				{
					result: 'fail',
					errorType: 'queryFailed',
					actualValue: 'http://url/index-hbbtv.html',
					expectedValue: 'test',
					contentType: 'testLine',
				},
				{stack: ''},
				{},
			),
			err => err instanceof assert.AssertionError &&
				err.message.includes('× http://url/index-hbbtv.html (actual)') &&
				err.message.includes('~ test (expected)'),
		);

		assert.throws(
			() => processServerResponse(logger, emptyString)(
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
			err => err instanceof assert.AssertionError &&
				err.message.includes('× height: 720 (actual)') &&
				err.message.includes('~ height: 100 (expected)') &&
				err.message.includes('× width: 1282 (actual)') &&
				err.message.includes('~ width: 200 (expected)'),
		);

		assert.throws(
			() => processServerResponse(logger, emptyString)(
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
			err => err instanceof assert.AssertionError &&
				err.message.includes('~ visibility: invisible (expected)') &&
				err.message.includes('× visibility: property missing (actual)'),
			'Should display proper error message for missingProperty that can be received ' +
			'when running device platform does not support specified property.',
		);

		assert.throws(
			() => processServerResponse(logger, emptyString)(
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
					isClick: true,
				},
				{
					type: 'testLine',
					request: {
						type: 'click',
						target: {
							type: 'element',
							val: {
								css: 'body',
							},
						},
						clicks: [
							{
								type: 'single',
								button: 'left',
							},
						],
						count: 1,
						delay: 1,
						condition: {
							expression: [
								{
									property: 'prop',
									val: 100,
								},
							],
						},
					},
				},
			),
			err => err instanceof assert.AssertionError &&
				err.message.includes('× prop: 200 (actual)') &&
				err.message.includes('~ prop: 100 (expected)'),
		);

		assert.throws(
			() => processServerResponse(logger, emptyString)(
				{result: 'fatal'}, {stack: ''}, {},
			), err => err.message.includes('Fatal'),
			'Fatal error thrown correctly',
		);

		sinon.stub(logger, 'warn');

		try {
			assert.strictEqual(processServerResponse(logger, emptyString)({
				contentType: 'eval',
				result: 'warning',
				errorType: 'error',
			}, {stack: ''}, {}), true, 'eval warning');
			assert.strictEqual(logger.warn.called, true, 'warning bumped');
		} finally {
			logger.warn.restore();
		}
	});

	describe('testing getRequestType helper', () => {
		it('should return testLine type', () => {
			assert.strictEqual(
				helpers.getRequestType({isAssert: true}),
				'testLine',
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
				'testLine',
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

	describe('Handle processed messages related to takeScreenshot lines', () => {
		const processTakeScreenshotResponse = processServerResponse(console);

		it('success for "raw" dataFormat', () => {
			const res = processTakeScreenshotResponse({
				contentType: 'takeScreenshot',
				result: 'success',
				buffer: Buffer.from([1, 2, 3]),
			}, {
				type: 'takeScreenshot',
				stack: '',
				dataFormat: 'raw',
			}, {
				type: 'takeScreenshot',
			});

			assert.deepStrictEqual(res, Buffer.from([1, 2, 3]));
		});

		it('success for "base64" dataFormat', () => {
			const res = processTakeScreenshotResponse({
				contentType: 'takeScreenshot',
				result: 'success',
				buffer: Buffer.from([1, 2, 3]),
			}, {
				type: 'takeScreenshot',
				stack: '',
				dataFormat: 'base64',
			}, {
				type: 'takeScreenshot',
			});

			assert.deepStrictEqual(res, Buffer.from([1, 2, 3]).toString('base64'));
		});

		describe('handle errors', () => {
			it('without specified "errorType" and "error" in response', () => {
				assert.throws(
					() => processTakeScreenshotResponse({
						contentType: 'takeScreenshot',
						result: 'error',
					}, {
						type: 'takeScreenshot',
						stack: '',
					}, {
						type: 'takeScreenshot',
					}),
					err => err instanceof SuitestError &&
						err.code === SuitestError.EVALUATION_ERROR &&
						err.message.includes('Failed to take screenshot'),
				);
			});
			it('with specified "error"', () => {
				assert.throws(
					() => processTakeScreenshotResponse({
						contentType: 'takeScreenshot',
						result: 'error',
						error: 'Some error related to making screenshot fail',
					}, {
						type: 'takeScreenshot',
						stack: '',
					}, {
						type: 'takeScreenshot',
					}),
					err => err instanceof SuitestError &&
						err.code === SuitestError.EVALUATION_ERROR &&
						err.message.includes('Some error related to making screenshot fail'),
				);
			});
			[
				['notSupportedDriver', 'Screenshots are not supported on this device.'],
				['notSupportedIL', 'Screenshots are not supported with this instrumentation library version.'],
				['timeout', 'Failed to take a screenshot due to timeout.'],
				['generalError', 'Failed to take a screenshot.'],
			].forEach(([errorType, expectedMessage]) => {
				it(`for "${errorType}" expected message: "${expectedMessage}"`, () => {
					assert.throws(
						() => processTakeScreenshotResponse({
							contentType: 'takeScreenshot',
							result: 'error',
							errorType,
						}, {
							type: 'takeScreenshot',
							stack: '',
						}, {
							type: 'takeScreenshot',
						}),
						err => err instanceof SuitestError &&
							err.code === SuitestError.EVALUATION_ERROR &&
							err.message.includes(expectedMessage),
					);
				});
			});
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
				['/path/to/file.png', Buffer.from([1, 2, 3])],
			);
		} finally {
			writeFileStub.restore();
		}
	});

	it('Handle aborted message', async() => {
		const loggerErrorStub = sinon.fake();

		assert.throws(
			() => processServerResponse({error: loggerErrorStub})(
				{
					result: 'aborted',
					message: {info: {}},
					lineId: '2',
					timeStarted: 1603368650150,
					timeFinished: 1603368655763,
					timeHrDiff: [5, 611864587],
					timeScreenshotHr: [0, 0],
					contentType: 'testLine',
				},
				{
					type: 'sleep',
					milliseconds: 100000,
					stack: 'Error\n' +
						'    at /suitest-js-api/lib/utils/makeChain.js:10:23\n' +
						'    at /suitest-js-api/lib/utils/sentry/Raven.js:61:19\n' +
						'    at Object.value [as toAssert] (/suitest-js-api/lib/utils/makeComposer.js:24:23)\n' +
						'    at Object.sleepAssert [as sleep] (/suitest-js-api/lib/chains/sleepChain.js:81:57)\n' +
						'    at Context.<anonymous> (/suitest-js-api-mocha-demo/test/dummy.test.js:12:16)\n' +
						'    at processTicksAndRejections (internal/process/task_queues.js:93:5)',
					isAssert: true,
				},
				{
					type: 'testLine',
					request: {
						type: 'sleep',
						timeout: 100000,
					},
				},
			),
			err => err instanceof SuitestError &&
				err.code === SuitestError.UNKNOWN_ERROR &&
				err.message === 'Test execution was aborted.',
		);
		assert(loggerErrorStub.calledWith('Test execution was aborted.'));
	});
});
