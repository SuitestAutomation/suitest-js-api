const assert = require('assert');
const utils = require('../../lib/utils/chainUtils');
const text = require('@suitest/smst-to-text');
const translate = require('../../lib/utils/translateResults');
const sinon = require('sinon');
const nock = require('nock');
const config = require('../../config');
const endpoints = require('../../lib/api/endpoints');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');
const SuitestError = require('../../lib/utils/SuitestError');

describe('chainUtils', () => {
	beforeEach(() => {
		sinon.stub(text, 'toText').returns('text');
		sinon.stub(translate, 'translateTestLine').returns('test line');
		sinon.stub(translate, 'translateTestLineResult').returns('test result');
	});
	afterEach(() => {
		text.toText.restore();
		translate.translateTestLine.restore();
		translate.translateTestLineResult.restore();
		nock.cleanAll();
	});
	it('isDefNegated should produce correct output', () => {
		assert.strictEqual(utils.isDefNegated({condition: {type: '!='}}), true);
		assert.strictEqual(utils.isDefNegated({condition: {type: 'a!='}}), false);
	});

	it('getPureComparatorType should produce correct output', () => {
		assert.strictEqual(utils.getPureComparatorType({condition: {type: '!='}}), '=');
		assert.strictEqual(utils.getPureComparatorType({condition: {type: '='}}), '=');
		assert.strictEqual(utils.getPureComparatorType({}), undefined);
	});

	it('getTimeoutValue should produce correct output', () => {
		assert.strictEqual(utils.getTimeoutValue({timeout: undefined}, 2), 2);
		assert.strictEqual(utils.getTimeoutValue({timeout: 10}, 2), 10);
		assert.strictEqual(utils.getTimeoutValue({timeout: '10'}, 2), '10');
	});

	it('translateLine should produce correct output', () => {
		assert.strictEqual(utils.translateLine({type: 'takeScreenshot'}, 'verbose'), '|E|text');
		assert.strictEqual(utils.translateLine({type: 'testLine', request: {type: 'assert'}}, 'silly'), '|A|text');
		assert.strictEqual(utils.translateLine({type: 'takeScreenshot'}, 'silly'), '|E|text');
	});

	it('fetchTestDefinitions should fetch and handle line defs', async() => {
		const authorizeHttp = () => ({});

		nock(config.apiUrl)
			.get(makeUrlFromArray([
				`${endpoints.appTestDefinitionById}?includeChangelist=${false}`,
				{appId: 'appId', versionId: 'versionId', testId: 'mainTestId'},
			]))
			.reply(200, {definition: [{lineId: '1', type: 'sleep', val: 1000}]});
		const fetchedData = await utils.fetchTestDefinitions({authContext: {authorizeHttp}})(
			'appId', 'versionId', 'mainTestId', false, 'stack',
		);

		assert.deepStrictEqual(fetchedData, {
			'mainTestId': [
				{
					'lineId': '1',
					'type': 'sleep',
					'val': 1000,
				},
			],
		}, 'fetched snippet data');
	});

	it('fetchTestDefinitions should fetch and handle line defs with snippets inside', async() => {
		const authorizeHttp = () => ({});

		nock(config.apiUrl)
			.get(makeUrlFromArray([
				`${endpoints.appTestDefinitionById}?includeChangelist=${false}`,
				{appId: 'appId', versionId: 'versionId', testId: 'mainTestId'},
			]))
			.reply(200, {definition: [{lineId: '1', type: 'runSnippet', val: 'test2'}]});
		nock(config.apiUrl)
			.get(makeUrlFromArray([
				`${endpoints.appTestDefinitionById}?includeChangelist=${false}`,
				{appId: 'appId', versionId: 'versionId', testId: 'test2'},
			]))
			.reply(200, {definition: [{lineId: '1', type: 'sleep', val: 200}]});
		const fetchedData = await utils.fetchTestDefinitions({authContext: {authorizeHttp}})(
			'appId', 'versionId', 'mainTestId', false, 'stack',
		);

		assert.deepStrictEqual(fetchedData, {'mainTestId': [
			{
				'lineId': '1',
				'type': 'runSnippet',
				'val': 'test2',
			},
		],
		'test2': [
			{
				'lineId': '1',
				'type': 'sleep',
				'val': 200,
			},
		]}, 'fetched snippet data');
	});

	it('fetchTestDefinitions should fetch throw error if test not found', async() => {
		const authorizeHttp = () => ({});

		nock(config.apiUrl)
			.get(makeUrlFromArray([
				`${endpoints.appTestDefinitionById}?includeChangelist=${false}`,
				{appId: 'appId', versionId: 'versionId', testId: 'mainTestId'},
			]))
			.reply(404, 'not found');

		await assertThrowsAsync(utils.fetchTestDefinitions({authContext: {authorizeHttp}})
				.bind(null, 'appId', 'versionId', 'mainTestId', false, 'stack'),
			err => err instanceof SuitestError &&
				err.code === SuitestError.INVALID_INPUT);
	});

	it('fetchTestDefinitions should fetch and handle line defs with excluded snippets inside', async() => {
		const authorizeHttp = () => ({});

		nock(config.apiUrl)
			.get(makeUrlFromArray([
				`${endpoints.appTestDefinitionById}?includeChangelist=${false}`,
				{appId: 'appId', versionId: 'versionId', testId: 'mainTestId'},
			]))
			.reply(200, {definition: [{lineId: '1', excluded: true, type: 'runSnippet', val: 'test2'}]});
		nock(config.apiUrl)
			.get(makeUrlFromArray([
				`${endpoints.appTestDefinitionById}?includeChangelist=${false}`,
				{appId: 'appId', versionId: 'versionId', testId: 'test2'},
			]))
			.reply(200, {definition: [{lineId: '1', type: 'sleep', val: 200}]});
		const fetchedData = await utils.fetchTestDefinitions({authContext: {authorizeHttp}})(
			'appId', 'versionId', 'mainTestId', false, 'stack',
		);

		assert.deepStrictEqual(fetchedData, {'mainTestId': [
			{
				'lineId': '1',
				'excluded': true,
				'type': 'runSnippet',
				'val': 'test2',
			},
		]}, 'fetched snippet data');
	});
});
