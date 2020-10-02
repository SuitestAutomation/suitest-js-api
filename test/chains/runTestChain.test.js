const assert = require('assert');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	runTest,
	runTestAssert,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/runTestChain')(suitest);
const sinon = require('sinon');

describe('Run test chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = runTest('testID');

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toAssert, 'function');
		assert.strictEqual(typeof chain.repeat, 'function');
		assert.strictEqual(typeof chain.until, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have allowed modifiers after abandon', () => {
		const chain = runTest('testId').abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(runTest, []);
		testInputErrorSync(runTest, ['']);
		testInputErrorSync(runTest, [42]);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			testId: 'testId',
		}), {
			type: 'testLine',
			request: {
				type: 'runSnippet',
				val: 'testId',
				count: 1,
			},
		}, 'type testLine default');
	});

	it('should define assert function', () => {
		const chain = runTestAssert('testId');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});
});
