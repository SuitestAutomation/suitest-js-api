const assert = require('assert');
const sinon = require('sinon');
const {matchComposer} = require('../../lib/composers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	ELEMENT_PROP,
	VALUE,
} = require('../../lib/constants/element');
const {
	SUBJ_COMPARATOR,
	PROP_COMPARATOR,
} = require('../../lib/constants/comparator');

describe('Match Composer', () => {
	it('should provide .match and .matches methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.match, 'function');
		assert.strictEqual(typeof chain.matches, 'function');

		const matchDescriptor = Object.getOwnPropertyDescriptor(chain, 'match');
		const matchesDescriptor = Object.getOwnPropertyDescriptor(chain, 'matches');

		assert.strictEqual(matchDescriptor.enumerable, true);
		assert.strictEqual(matchDescriptor.writable, false);
		assert.strictEqual(matchDescriptor.configurable, false);

		assert.strictEqual(matchesDescriptor.enumerable, true);
		assert.strictEqual(matchesDescriptor.writable, false);
		assert.strictEqual(matchesDescriptor.configurable, false);
	});

	it('should accept single property spread to arguments', () => {
		// suitest.element('some name')
		const data = {selector: {apiId: 'some name'}};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchComposer(data, chain, makeChain));

		chain.match(ELEMENT_PROP.WIDTH);
		assert.deepEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.WIDTH,
						val: VALUE.REPO,
						type: PROP_COMPARATOR.EQUAL,
						deviation: undefined,
					},
				],
			},
			selector: {apiId: 'some name'},
		});

		chain.match(ELEMENT_PROP.HEIGHT, 500);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.HEIGHT,
						val: 500,
						type: PROP_COMPARATOR.EQUAL,
						deviation: undefined,
					},
				],
			},
			selector: {apiId: 'some name'},
		});

		chain.match(ELEMENT_PROP.URL, 'some string');
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.URL,
						val: 'some string',
						type: PROP_COMPARATOR.EQUAL,
						deviation: undefined,
					},
				],
			},
			selector: {apiId: 'some name'},
		});

		chain.match(ELEMENT_PROP.TOP, 500, PROP_COMPARATOR.GREATER);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.TOP,
						val: 500,
						type: PROP_COMPARATOR.GREATER,
						deviation: undefined,
					},
				],
			},
			selector: {apiId: 'some name'},
		});

		chain.match(ELEMENT_PROP.LEFT, 500, PROP_COMPARATOR.APPROX, 20);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.LEFT,
						val: 500,
						type: PROP_COMPARATOR.APPROX,
						deviation: 20,
					},
				],
			},
			selector: {apiId: 'some name'},
		});

		// Valid
		assert.strictEqual(chain.match(ELEMENT_PROP.TOP, 10), undefined, 'integer');
		assert.strictEqual(chain.match(ELEMENT_PROP.IS_CHECKED, true), undefined, 'boolean');
		assert.strictEqual(chain.match(ELEMENT_PROP.PIVOT_X, 0.5), undefined, 'number');
		assert.strictEqual(chain.match(ELEMENT_PROP.BG_COLOR, '#fff'), undefined, 'string');
		assert.strictEqual(chain.match(ELEMENT_PROP.TEXT_SIZE, VALUE.REPO), undefined, 'constant');
	});

	it('should throw error in case of invalid input', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchComposer(data, chain, makeChain));

		testInputErrorSync(chain.match, ['height']);
		testInputErrorSync(chain.match, [Symbol('height')]);
		testInputErrorSync(chain.match, [ELEMENT_PROP.LEFT, 500, Symbol('>')]);
		testInputErrorSync(chain.match, ['Content-Type', 500]);
		testInputErrorSync(chain.match, [ELEMENT_PROP.LEFT, 500, PROP_COMPARATOR.APPROX, '20']);
		testInputErrorSync(chain.match, [ELEMENT_PROP.LEFT, '10']);
		testInputErrorSync(chain.match, [ELEMENT_PROP.BG_COLOR, 10]);
		testInputErrorSync(chain.match, [ELEMENT_PROP.URL, 10]);
		testInputErrorSync(chain.match, [ELEMENT_PROP.BG_COLOR, VALUE.REPO]);
		testInputErrorSync(chain.match, [{
			name: ELEMENT_PROP.BG_COLOR,
			val: VALUE.REPO,
		}]);
	});

	it('should accept object with single property as object', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchComposer(data, chain, makeChain));

		chain.match({
			name: ELEMENT_PROP.WIDTH,
			val: 100,
			type: PROP_COMPARATOR.LESSER,
			deviation: undefined,
		});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.WIDTH,
						val: 100,
						type: PROP_COMPARATOR.LESSER,
						deviation: undefined,
					},
				],
			},
		});

		chain.match({
			name: ELEMENT_PROP.WIDTH,
			val: 100,
		});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.WIDTH,
						val: 100,
						type: PROP_COMPARATOR.EQUAL,
						deviation: undefined,
					},
				],
			},
		});

		chain.match({
			name: ELEMENT_PROP.WIDTH,
			val: 100,
			type: PROP_COMPARATOR.APPROX,
			deviation: 10,
		});

		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.WIDTH,
						val: 100,
						type: PROP_COMPARATOR.APPROX,
						deviation: 10,
					},
				],
			},
		});
	});

	it('should accept array of property definitions as a shortcut', () => {
		const data = {selector: {apiId: 'some name'}};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchComposer(data, chain, makeChain));

		chain.match([
			ELEMENT_PROP.WIDTH,
			{
				name: ELEMENT_PROP.HEIGHT,
				val: 100,
				type: PROP_COMPARATOR.GREATER,
			},
			{
				name: ELEMENT_PROP.HEIGHT,
				val: 200,
				type: PROP_COMPARATOR.LESSER,
			},
			{
				name: ELEMENT_PROP.WIDTH,
				val: 100,
				type: PROP_COMPARATOR.APPROX,
				deviation: 10,
			},
		]);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.WIDTH,
						val: VALUE.REPO,
						type: PROP_COMPARATOR.EQUAL,
						deviation: undefined,
					},
					{
						name: ELEMENT_PROP.HEIGHT,
						val: 100,
						type: PROP_COMPARATOR.GREATER,
						deviation: undefined,
					},
					{
						name: ELEMENT_PROP.HEIGHT,
						val: 200,
						type: PROP_COMPARATOR.LESSER,
						deviation: undefined,
					},
					{
						name: ELEMENT_PROP.WIDTH,
						val: 100,
						type: PROP_COMPARATOR.APPROX,
						deviation: 10,
					},
				],
			},
			selector: {apiId: 'some name'},
		});
	});
});
