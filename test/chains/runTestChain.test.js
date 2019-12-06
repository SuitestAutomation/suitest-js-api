const nock = require('nock');
const assert = require('assert');
const {config} = require('../../config');
const {
	runTest,
	runTestAssert,
	toJSON,
	getSnippetLogs,
	fetchTestDefinitions,
} = require('../../lib/chains/runTestChain');
const {authContext} = require('../../lib/context');
const endpoints = require('../../lib/api/endpoints');
const testServer = require('../../lib/utils/testServer');
const SuitestError = require('../../lib/utils/SuitestError');
const sessionConstants = require('../../lib/constants/session');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

const definitionsById = {
	'test1': [{
		type: 'openApp', // openApp are not present in results
	}, {
		type: 'sleep',
	}, {
		type: 'runSnippet',
		val: 'test2',
	}],
	'test2': [{
		type: 'openApp',
	}, {
		type: 'sleep',
	}, {
		type: 'runSnippet',
		val: 'test3',
	}, {
		type: 'runSnippet',
		val: 'test3',
	}, {
		type: 'sleep',
	}],
	'test3': [{
		type: 'openApp',
	}, {
		type: 'sleep',
	}, {
		type: 'sleep',
		excluded: true, // this flag does not matter, line will not be present in results
	}, {
		type: 'assert',
	}, {
		type: 'sleep',
	}],
};

describe('Run test chain', () => {
	before(async() => {
		await testServer.start();
	});

	beforeEach(() => {
		authContext.clear();
	});

	after(async() => {
		nock.cleanAll();
		authContext.clear();
		await testServer.stop();
	});

	it('should have all necessary modifiers', () => {
		const chain = runTest('testID');

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toAssert, 'function');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.until, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have allowed modifiers after abandon', () => {
		const chain = runTest('testId').abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
		assert.strictEqual(
			runTest('testId').toString(),
			'Running test by ID "testId"'
		);
		assert.strictEqual(
			runTest('testId').repeat(10).toString(),
			'Running test by ID "testId", repeat 10 times'
		);
		assert.strictEqual(
			runTest('testId')
				.until({
					toJSON: () => ({
						request: {
							condition: {
								subject: {
									type: 'location',
								},
							},
						},
					}),
				})
				.repeat(10).toString(),
			'Running test by ID "testId", repeat 10 times'
		);
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(runTest, []);
		testInputErrorSync(runTest, ['']);
		testInputErrorSync(runTest, [42]);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			testId: 'testId',
		}), {
			type: 'testLine',
			request: {
				type: 'runSnippet',
				val: 'testId',
				count: 1,
			},
		}, 'type testLine default');
	});

	it('should define assert function', () => {
		const chain = runTestAssert('testId');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});

	describe('getSnippetLogs method', () => {
		it('should produce correct output', () => {
			const rootResults = [{
				result: 'success',
				lineId: '2-2',
			}, {
				result: 'fail',
				lineId: '2-3',
				results: [{
					result: 'success',
					lineId: '2-3-2',
				}, {
					result: 'fail',
					lineId: '2-3-3',
					loopResults: [{
						results: [{
							result: 'success',
							lineId: '2-3-3-2',
						}, {
							result: 'success',
							lineId: '2-3-3-4',
						}, {
							result: 'success',
							lineId: '2-3-3-5',
						}],
					}, {
						results: [{
							result: 'success',
							lineId: '2-3-3-2',
						}, {
							result: 'success',
							lineId: '2-3-3-4',
						}, {
							result: 'fail',
							lineId: '2-3-3-5',
						}],
					}],
				}, {
					result: 'success',
					lineId: '2-3-4',
					loopResults: [{
						results: [{
							result: 'success',
							lineId: '2-3-4-2',
						}, {
							result: 'success',
							lineId: '2-3-4-4',
						}, {
							result: 'success',
							lineId: '2-3-4-5',
						}],
					}, {
						results: [{
							result: 'success',
							lineId: '2-3-4-2',
						}, {
							result: 'success',
							lineId: '2-3-4-4',
						}, {
							result: 'success',
							lineId: '2-3-4-5',
						}],
					}],
				}, {
					result: 'success',
					lineId: '2-3-5',
				}],
			}];

			const translate = (line, res) => `${line.type}: ${res.result}`;

			assert.deepStrictEqual(
				getSnippetLogs({
					testId: 'test1',
					definitions: definitionsById,
					results: rootResults,
					withChanges: true,
					level: 1,
					translateResult: translate,
				}),
				[
					'    sleep: success',
					'    runSnippet: fail',
					'    - with version unapplied changes',
					'        sleep: success',
					'        runSnippet: fail',
					'        - with version unapplied changes',
					'        - loop count: 1',
					'            sleep: success',
					'            assert: success',
					'            sleep: success',
					'        - loop count: 2',
					'            sleep: success',
					'            assert: success',
					'            sleep: fail',
					'        end of "test3" test',
					'        runSnippet: success',
					'        - with version unapplied changes',
					'        - loop count: 1',
					'            sleep: success',
					'            assert: success',
					'            sleep: success',
					'        - loop count: 2',
					'            sleep: success',
					'            assert: success',
					'            sleep: success',
					'        end of "test3" test',
					'        sleep: success',
					'    end of "test2" test',
				],
			);
		});
	});

	describe('fetchTestDefinitions method', () => {
		const formUrl = testId => makeUrlFromArray([endpoints.appTestDefinitionById, {
			appId: 'appId',
			versionId: 'versionId',
			testId,
		}]) + '?includeChangelist=true';

		const args = ['appId', 'versionId', 'testId', true];

		it('should fail with proper error if auth context is not set', async() => {
			await assertThrowsAsync(
				() => fetchTestDefinitions(...args),
				err => err.code === SuitestError.AUTH_NOT_ALLOWED,
			);
		});

		it('should fail with proper network', async() => {
			nock(config.apiUrl).get(formUrl('testId')).reply(404);
			authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId', 'tokenPass');

			await assertThrowsAsync(
				() => fetchTestDefinitions(...args),
				err => err.code === SuitestError.SERVER_ERROR,
			);
		});

		it('should return proper test definitons without duplicated test calls', async() => {
			nock(config.apiUrl).get(formUrl('test1')).reply(200, {definition: definitionsById.test1});
			nock(config.apiUrl).get(formUrl('test2')).reply(200, {definition: definitionsById.test2});
			nock(config.apiUrl).get(formUrl('test3')).reply(200, {definition: definitionsById.test3});
			authContext.setContext(sessionConstants.INTERACTIVE, 'tokenId', 'tokenPass');

			const resp = await fetchTestDefinitions('appId', 'versionId', 'test1', true);

			assert.deepStrictEqual(resp, definitionsById);
		});
	});
});
