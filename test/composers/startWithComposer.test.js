const assert = require('assert');
const sinon = require('sinon');
const {startWithComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const testInputError = require('../../lib/utils/testHelpers/testInputError');

describe('Start With Composer', () => {
	it('should provide .startWith and .startsWith methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, startWithComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');

		const startWithDescriptor = Object.getOwnPropertyDescriptor(chain, 'startWith');
		const startsWithDescriptor = Object.getOwnPropertyDescriptor(chain, 'startsWith');

		assert.strictEqual(startWithDescriptor.enumerable, true);
		assert.strictEqual(startWithDescriptor.writable, false);
		assert.strictEqual(startWithDescriptor.configurable, false);

		assert.strictEqual(startsWithDescriptor.enumerable, true);
		assert.strictEqual(startsWithDescriptor.writable, false);
		assert.strictEqual(startsWithDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, startWithComposer(data, chain, makeChain));

		chain.startsWith('test');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.START_WITH,
				val: 'test',
			},
		});
	});

	it('throw error if value is invalid', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, startWithComposer(data, chain, makeChain));

		await testInputError(chain.startsWith, [1]);
		await testInputError(chain.startsWith, []);
		await testInputError(chain.startsWith, [null]);
	});
});
