const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	networkRequest,
	networkRequestAssert,
	toJSON,
	getComposers,
	beforeSendMsg,
	toString,
} = require('../../lib/chains/networkRequestChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../../lib/constants/comparator');
const {NETWORK_PROP, NETWORK_METHOD} = require('../../lib/constants/networkRequest');
const sinon = require('sinon');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');

describe('Network request chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.ASSERT,
			composers.CLONE,
			composers.GETTERS,
			composers.TIMEOUT,
			composers.REQUEST_MATCHES,
			composers.RESPONSE_MATCHES,
			composers.WAS_MADE,
			composers.WILL_BE_MADE,
			composers.CONTAIN,
			composers.EQUAL,
			composers.NOT,
			composers.TO_JSON,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAssert: true,
			isAbandoned: true,
			request: {},
			response: {},
			wasMade: true,
			timeout: 0,
			comparator: {},
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.CLONE,
			composers.GETTERS,
			composers.TO_JSON,
			composers.NOT,
		].sort(bySymbol), 'filled in state');
	});

	it('should convert to string with meaningful message', () => {
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').wasMade().toString(),
			'Checking if a network request\nto URL: http://suite.st/test\nwas made'
		);
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').not().wasMade().toString(),
			'Checking if a network request\nto URL: http://suite.st/test\nwas NOT made'
		);
		assert.strictEqual(
			networkRequest().contains('test').wasMade().toString(),
			'Checking if a network request\nmatching: test\nwas made'
		);
		assert.strictEqual(
			networkRequest().contains('test').not().wasMade().toString(),
			'Checking if a network request\nmatching: test\nwas NOT made'
		);
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').requestMatches({
				name: 'test',
				val: 'test',
			}).wasMade().toString(),
			'Checking if a network request\n' +
			'to URL: http://suite.st/test\n' +
			'With request headers: \n' +
			'  test: test\n' +
			'was made'
		);
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').requestMatches({
				name: 'test',
				val: 'test',
			}).not().wasMade().toString(),
			'Checking if a network request\n' +
			'to URL: http://suite.st/test\n' +
			'With request headers: \n' +
			'  test: test\n' +
			'was NOT made'
		);
		assert.strictEqual(
			networkRequest().contains('test').requestMatches({
				name: 'test',
				val: 'test',
			}).wasMade().toString(),
			'Checking if a network request\n' +
			'matching: test\n' +
			'With request headers: \n' +
			'  test: test\n' +
			'was made'
		);
		assert.strictEqual(
			networkRequest().contains('test').requestMatches({
				name: 'headerName',
				val: 'headerVal',
			}).not().wasMade().toString(),
			'Checking if a network request\n' +
			'matching: test\n' +
			'With request headers: \n' +
			'  headerName: headerVal\n' +
			'was NOT made'
		);
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').willBeMade().toString(),
			'Checking if a network request\n' +
			'to URL: http://suite.st/test\n' +
			'will made during the next 2000 ms'
		);
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').not().willBeMade().toString(),
			'Checking if a network request\n' +
			'to URL: http://suite.st/test\n' +
			'will NOT be made during the next 2000 ms'
		);
		assert.strictEqual(
			networkRequest().contains('test').willBeMade().toString(),
			'Checking if a network request\n' +
			'matching: test\n' +
			'will made during the next 2000 ms'
		);
		assert.strictEqual(
			networkRequest().contains('test').not().willBeMade().toString(),
			'Checking if a network request\n' +
			'matching: test\n' +
			'will NOT be made during the next 2000 ms'
		);
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').requestMatches({
				name: 'headerName',
				val: 'headerVal',
			}).willBeMade().toString(),
			'Checking if a network request\n' +
			'to URL: http://suite.st/test\n' +
			'With request headers: \n' +
			'  headerName: headerVal\n' +
			'will made during the next 2000 ms'
		);
		assert.strictEqual(
			networkRequest().equals('http://suite.st/test').requestMatches({
				name: 'headerName',
				val: 'headerVal',
			}).not().willBeMade().toString(),
			'Checking if a network request\n' +
			'to URL: http://suite.st/test\n' +
			'With request headers: \n' +
			'  headerName: headerVal\n' +
			'will NOT be made during the next 2000 ms'
		);
		assert.strictEqual(
			networkRequest().contains('test').requestMatches({
				name: 'headerName',
				val: 'headerVal',
			}).willBeMade().toString(),
			'Checking if a network request\n' +
			'matching: test\n' +
			'With request headers: \n' +
			'  headerName: headerVal\n' +
			'will made during the next 2000 ms'
		);
		assert.strictEqual(
			networkRequest().contains('test').requestMatches({
				name: 'headerName',
				val: 'headerVal',
			}).not().willBeMade().toString(),
			'Checking if a network request\n' +
			'matching: test\n' +
			'With request headers: \n' +
			'  headerName: headerVal\n' +
			'will NOT be made during the next 2000 ms'
		);
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');
		const beforeSendMsgContains = assertBeforeSendMsg(beforeSendMsg, log);

		beforeSendMsgContains(
			{
				wasMade: true,
				comparator: {
					type: '=',
					val: 'http://example.net',
				},
			},
			'Launcher E Checking if a network request',
		);
		beforeSendMsgContains(
			{
				wasMade: true,
				comparator: {
					type: '=',
					val: 'http://example.net',
				},
				isAssert: true,
			},
			'Launcher A Checking if a network request',
		);
		log.restore();
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				val: 'test',
			},
			wasMade: true,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				timeout: 2000,
				condition: {
					subject: {
						type: 'network',
						requestInfo: [],
						responseInfo: [],
						compare: '=',
						val: 'test',
					},
					type: 'made',
					searchStrategy: 'all',
				},
			},
		});
		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				val: 'test',
			},
			wasMade: true,
			isNegated: true,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				timeout: 2000,
				condition: {
					subject: {
						type: 'network',
						requestInfo: [],
						responseInfo: [],
						compare: '=',
						val: 'test',
					},
					type: '!made',
					searchStrategy: 'all',
				},
			},
		});

		assert.deepStrictEqual(toJSON({
			isAssert: true,
			comparator: {
				type: SUBJ_COMPARATOR.CONTAIN,
				val: 'test',
			},
			wasMade: true,
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				timeout: 2000,
				condition: {
					subject: {
						type: 'network',
						requestInfo: [],
						responseInfo: [],
						compare: '~',
						val: 'test',
					},
					type: 'made',
					searchStrategy: 'all',
				},
			},
		});

		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				val: 'test',
			},
			willBeMade: true,
			timeout: 0,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'network',
						requestInfo: [],
						responseInfo: [],
						compare: '=',
						val: 'test',
					},
					type: 'made',
					searchStrategy: 'notMatched',
				},
			},
		});

		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				val: 'test',
			},
			request: {
				type: SUBJ_COMPARATOR.REQUEST_MATCHES,
				props: [
					{
						name: NETWORK_PROP.METHOD,
						val: NETWORK_METHOD.GET,
						compare: PROP_COMPARATOR.EQUAL,
					},
					{
						name: NETWORK_PROP.BODY,
						val: 'test',
						compare: PROP_COMPARATOR.EQUAL,
					},
					{
						name: 'header',
						val: 'test',
						compare: PROP_COMPARATOR.EQUAL,
					},
				],
			},
			response: {
				type: SUBJ_COMPARATOR.RESPONSE_MATCHES,
				props: [
					{
						name: NETWORK_PROP.STATUS,
						val: 500,
						compare: PROP_COMPARATOR.EQUAL,
					},
					{
						name: NETWORK_PROP.BODY,
						val: 'test',
						compare: PROP_COMPARATOR.EQUAL,
					},
					{
						name: 'header',
						val: 'test',
						compare: PROP_COMPARATOR.EQUAL,
					},
				],
			},
			wasMade: true,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				timeout: 2000,
				condition: {
					subject: {
						type: 'network',
						requestInfo: [
							{
								name: '@method',
								val: 'GET',
								compare: '=',
							},
							{
								name: '@body',
								val: 'test',
								compare: '=',
							},
							{
								name: 'header',
								val: 'test',
								compare: '=',
							},
						],
						responseInfo: [
							{
								name: '@status',
								val: 500,
								compare: '=',
							},
							{
								name: '@body',
								val: 'test',
								compare: '=',
							},
							{
								name: 'header',
								val: 'test',
								compare: '=',
							},
						],
						compare: '=',
						val: 'test',
					},
					type: 'made',
					searchStrategy: 'all',
				},
			},
		});
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(toJSON, [{}]);
		testInputErrorSync(toJSON, [{wasMade: true}]);
		testInputErrorSync(toJSON, [{
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				val: 'test',
			},
		}], {}, 'invalid error if no strategy defined');
	});

	it('should define assert function', () => {
		const chain = networkRequestAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});

	it('toString should return correct string', () => {
		assert.deepStrictEqual(toString({
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'network',
						compare: '=',
						val: 'test',
						requestInfo: [
							{
								name: '@method',
								val: 'GET',
								compare: '=',
							},
							{
								name: '@body',
								val: 'test',
								compare: '=',
							},
							{
								name: 'header',
								val: 'test',
								compare: '=',
							},
						],
						responseInfo: [
							{
								name: '@status',
								val: 500,
								compare: '=',
							},
							{
								name: '@body',
								val: 'test',
								compare: '=',
							},
							{
								name: 'header',
								val: 'test',
								compare: '=',
							},
						],
					},
					type: 'made',
					searchStrategy: 'all',
				},
				timeout: 2000,
			},
		}), ['Checking if a network request',
			'to URL: test',
			'With request headers: ',
			'  @method: GET',
			'  @body: test',
			'  header: test',
			'With response headers: ',
			'  @status: 500',
			'  @body: test',
			'  header: test',
			'was made'].join('\n'));
	});
});
