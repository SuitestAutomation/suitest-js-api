const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {languageComposer} = require('../../lib/composers');
const {suitestInvalidInputError} = require('../../lib/utils/testHelpers/testInputError');
const LANG = require('../../lib/constants/lang');

describe('Language Composer', () => {
	it('should provide .language', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, languageComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.language, 'function');

		const visibleDescriptor = Object.getOwnPropertyDescriptor(chain, 'language');

		assert.strictEqual(visibleDescriptor.enumerable, true);
		assert.strictEqual(visibleDescriptor.writable, false);
		assert.strictEqual(visibleDescriptor.configurable, false);
	});

	it('should set language to internal chain data', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, languageComposer(suitest, data, chain, makeChain));

		chain.language(LANG.ENGLISH);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {language: LANG.ENGLISH});
	});

	it('should throw error when language method called with wrong arguments', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, languageComposer(suitest, data, chain, makeChain));

		const languageShouldBeString =
			suitestInvalidInputError('Invalid input provided for .language function. Language should be string');

		assert.throws(() => chain.language(null), languageShouldBeString);
		assert.throws(() => chain.language(undefined), languageShouldBeString);
		assert.throws(() => chain.language(2), languageShouldBeString);
		assert.throws(() => chain.language({}), languageShouldBeString);
		assert.throws(() => chain.language([]), languageShouldBeString);

		const languageShouldBeOneOfValues =
			suitestInvalidInputError('Invalid input provided for .language function. Language should be equal to one of the allowed values: "eng", "deu", "fra", "ita", "nld", "spa", "pol", "bul"');

		assert.throws(() => chain.language(''), languageShouldBeOneOfValues);
		assert.throws(() => chain.language('unknown'), languageShouldBeOneOfValues);
	});
});
