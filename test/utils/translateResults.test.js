const assert = require('assert');
const {
	transformMarkdown,
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
