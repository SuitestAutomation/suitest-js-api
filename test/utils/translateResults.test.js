const assert = require('assert');
const {
	transformMarkdown,
	transformAllMarkdowns,
	titleDescToText,
	translateProgress,
	translateNotStartedReason,
} = require('../../lib/utils/translateResults');

describe('translateResults util', () => {
	describe('transformMarkdown method', () => {
		it('should transform markdown correctly', () => {
			assert.strictEqual(
				transformMarkdown(
					'[url](url), ' +
					'[link](url), ' +
					'[email](mailto:sales@test.com), ' +
					'[link](url){:target="_blank" rel="nofollow" title="hello" class="some-class"}, ' +
					'![preview](src), ' +
					'**bold**'
				),
				'(url), link (url), email (sales@test.com), link (url), preview (src), bold',
			);
		});
	});

	describe('transformAllMarkdowns method', () => {
		it('should transform all markdown strings in any structure correctly', () => {
			assert.deepStrictEqual(
				transformAllMarkdowns({
					title: '**title**',
					description: 'some text with [link](url)',
					details: [{
						prop: 'opacity',
						actual: 1,
						expected: 0,
						expectedDefault: false,
						comparator: '<=',
					}, {
						prop: 'href',
						actual: '[url1](url1)',
						expected: '[url2](url2)',
						expectedDefault: true,
						comparator: '=',
					}],
				}),
				{
					title: 'title',
					description: 'some text with link (url)',
					details: [{
						prop: 'opacity',
						actual: 1,
						expected: 0,
						expectedDefault: false,
						comparator: '<=',
					}, {
						prop: 'href',
						actual: '(url1)',
						expected: '(url2)',
						expectedDefault: true,
						comparator: '=',
					}],
				},
			);
		});
	});

	describe('makeSentence method', () => {
		it('should return proper string', () => {
			assert.strictEqual(
				titleDescToText({
					title: [{
						type: 'text',
						value: 'title',
					}],
					description: [{
						type: 'text',
						value: 'description',
					}],
				}),
				'title\ndescription',
			);
			assert.strictEqual(
				titleDescToText({
					title: [{
						type: 'text',
						value: 'title',
					}],
				}),
				'title',
			);
		});
	});

	describe('translateProgress method wrapper', () => {
		it('should throw error when unknown status, code provided', () => {
			assert.throws(() => translateProgress({
				status: 'summyStatus',
				code: 'dummyCode',
			}));
		});
	});

	describe('translateNotStartedReason method wrapper', () => {
		it('should throw error when unknown code provided', () => {
			assert.throws(() => translateNotStartedReason('dummyCode'));
		});
	});
});
