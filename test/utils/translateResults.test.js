const assert = require('assert');
const {
	transformMarkdown,
	transformAllMarkdowns,
	titleDescToText,
} = require('../../lib/utils/translateResults');

describe('translateResults util', () => {
	describe('transformMarkdown method', () => {
		it('should transform markdown correctly', () => {
			assert.strictEqual(
				transformMarkdown(
					'[link](url), ' +
					'[email](mailto:sales@test.com), ' +
					'[link](url){:target="_blank"}, ' +
					'![preview](src), ' +
					'**bold**'
				),
				'url, sales@test.com, url, src, bold',
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
						actual: '[link](url1)',
						expected: '[link](url2)',
						expectedDefault: true,
						comparator: '=',
					}],
				}),
				{
					title: 'title',
					description: 'some text with url',
					details: [{
						prop: 'opacity',
						actual: 1,
						expected: 0,
						expectedDefault: false,
						comparator: '<=',
					}, {
						prop: 'href',
						actual: 'url1',
						expected: 'url2',
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
					title: 'title',
					description: 'description',
				}),
				'title.\ndescription.',
			);
			assert.strictEqual(
				titleDescToText({
					title: 'title',
					description: '',
				}),
				'title.',
			);
		});
	});
});
