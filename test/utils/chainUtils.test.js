const assert = require('assert');
const utils = require('../../lib/utils/chainUtils');
const text = require('@suitest/smst-to-text');
const translate = require('../../lib/utils/translateResults');
const sinon = require('sinon');

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
});
