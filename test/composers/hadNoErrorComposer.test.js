const assert = require('assert');
const sinon = require('sinon');
const {hadNoErrorComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const HAD_NO_ERROR = require('../../lib/constants/hadNoError');
const SuitestError = require('../../lib/utils/SuitestError');
const suitest = require('../../index');

describe('Had No Error Composer', () => {
	it('should provide .hadNoError method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, hadNoErrorComposer(suitest, data, chain, makeChain));

		const hadNoErrorDescriptor = Object.getOwnPropertyDescriptor(chain, 'hadNoError');

		assert.strictEqual(hadNoErrorDescriptor.enumerable, true);
		assert.strictEqual(hadNoErrorDescriptor.writable, false);
		assert.strictEqual(hadNoErrorDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, hadNoErrorComposer(suitest, data, chain, makeChain));

		chain.hadNoError();

		assert.deepStrictEqual(
			makeChain.firstCall.args[0],
			{
				comparator: {type: SUBJ_COMPARATOR.HAD_NO_ERROR},
				searchStrategy: 'currentUrl',
			}
		);
	});

	it('should generate a new chain with proper searchStrategy', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, hadNoErrorComposer(suitest, data, chain, makeChain));

		chain.hadNoError();
		assert.deepStrictEqual(
			makeChain.firstCall.args[0],
			{
				comparator: {type: SUBJ_COMPARATOR.HAD_NO_ERROR},
				searchStrategy: 'currentUrl',
			},
			'check default value for searchStrategy'
		);

		chain.hadNoError(HAD_NO_ERROR.CURRENT_URL);
		assert.deepStrictEqual(
			makeChain.lastCall.args[0],
			{
				comparator: {type: SUBJ_COMPARATOR.HAD_NO_ERROR},
				searchStrategy: 'currentUrl',
			},
		);

		chain.hadNoError(HAD_NO_ERROR.ALL);
		assert.deepStrictEqual(
			makeChain.lastCall.args[0],
			{
				comparator: {type: SUBJ_COMPARATOR.HAD_NO_ERROR},
				searchStrategy: 'all',
			}
		);
	});

	it('check validation', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, hadNoErrorComposer(suitest, data, chain, makeChain));

		assert.throws(
			() => chain.hadNoError(null),
			new SuitestError(
				// eslint-disable-next-line max-len
				'Invalid input provided for .hadNoError function. searchStrategy should be equal to one of the allowed values: "all", "currentUrl"',
				SuitestError.INVALID_INPUT
			),
		);
	});

	it('has proper constants in index.js', () => {
		assert.strictEqual(suitest.HAD_NO_ERROR.ALL, 'all');
		assert.strictEqual(suitest.HAD_NO_ERROR.CURRENT_URL, 'currentUrl');
	});
});
