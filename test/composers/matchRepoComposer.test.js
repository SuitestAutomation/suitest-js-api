const assert = require('assert');
const sinon = require('sinon');
const {matchRepoComposer} = require('../../lib/composers');
const {
	ELEMENT_PROP,
	VALUE,
} = require('../../lib/constants/element');
const {
	SUBJ_COMPARATOR,
	PROP_COMPARATOR,
} = require('../../lib/constants/comparator');

describe('Match Repo Composer', () => {
	it('should provide .matchRepo and .matchesRepo methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchRepoComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.matchRepo, 'function');
		assert.strictEqual(typeof chain.matchesRepo, 'function');

		const matchRepoDescriptor = Object.getOwnPropertyDescriptor(chain, 'matchRepo');
		const matchesRepoDescriptor = Object.getOwnPropertyDescriptor(chain, 'matchesRepo');

		assert.strictEqual(matchRepoDescriptor.enumerable, true);
		assert.strictEqual(matchRepoDescriptor.writable, false);
		assert.strictEqual(matchRepoDescriptor.configurable, false);

		assert.strictEqual(matchesRepoDescriptor.enumerable, true);
		assert.strictEqual(matchesRepoDescriptor.writable, false);
		assert.strictEqual(matchesRepoDescriptor.configurable, false);
	});

	it('should accept single property spread to arguments', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchRepoComposer(data, chain, makeChain));

		chain.matchRepo(ELEMENT_PROP.WIDTH);
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
				],
			},
		});

		chain.matchRepo(ELEMENT_PROP.TOP, PROP_COMPARATOR.GREATER);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.TOP,
						val: VALUE.REPO,
						type: PROP_COMPARATOR.GREATER,
						deviation: undefined,
					},
				],
			},
		});

		chain.matchRepo(ELEMENT_PROP.LEFT, PROP_COMPARATOR.APPROX, 20);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.LEFT,
						val: VALUE.REPO,
						type: PROP_COMPARATOR.APPROX,
						deviation: 20,
					},
				],
			},
		});

		// Invalid
		assert.throws(() => chain.matchRepo('height'), 'Property is not a Symbol');
		assert.throws(() => chain.matchRepo(Symbol('height')), 'Property is unknown Symbol');
		assert.throws(() => chain.matchRepo(ELEMENT_PROP.HEIGHT, 500), 'Value provided for repo');
		assert.throws(() => chain.matchRepo(ELEMENT_PROP.LEFT, '>'), 'Comparator is not a Symbol');
		assert.throws(() => chain.matchRepo(ELEMENT_PROP.LEFT, Symbol('>')), 'Comparator is unknown Symbol');
		assert.throws(
			() => chain.matchRepo(ELEMENT_PROP.LEFT, PROP_COMPARATOR.APPROX, '20'),
			'Accuracy is not a number'
		);
	});



	it('should accept object with single property as object', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchRepoComposer(data, chain, makeChain));

		chain.matchRepo({
			name: ELEMENT_PROP.WIDTH,
			type: PROP_COMPARATOR.LESSER,
			deviation: undefined,
		});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH,
				props: [
					{
						name: ELEMENT_PROP.WIDTH,
						val: VALUE.REPO,
						type: PROP_COMPARATOR.LESSER,
						deviation: undefined,
					},
				],
			},
		});

		// Should throw if val provided
		assert.throws(() => chain.matchRepo({
			name: ELEMENT_PROP.WIDTH,
			val: 100,
		}));
	});

	it('should accept array of property definitions as a shortcut', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchRepoComposer(data, chain, makeChain));

		chain.matchRepo([
			{
				name: ELEMENT_PROP.WIDTH,
			},
			{
				name: ELEMENT_PROP.LEFT,
				type: PROP_COMPARATOR.LESSER,
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
						name: ELEMENT_PROP.LEFT,
						val: VALUE.REPO,
						type: PROP_COMPARATOR.LESSER,
						deviation: undefined,
					},
				],
			},
		});
	});
});
