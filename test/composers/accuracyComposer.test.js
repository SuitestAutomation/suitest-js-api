const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {accuracyComposer} = require('../../lib/composers');
const {getAccuracy} = require('../../lib/composers/accuracyComposer');
const {suitestInvalidInputError} = require('../../lib/utils/testHelpers/testInputError');
const ACCURACY = require('../../lib/constants/accuracy');

describe('Accuracy Composer', () => {
	it('should provide .accuracy', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, accuracyComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.accuracy, 'function');

		const visibleDescriptor = Object.getOwnPropertyDescriptor(chain, 'accuracy');

		assert.strictEqual(visibleDescriptor.enumerable, true);
		assert.strictEqual(visibleDescriptor.writable, false);
		assert.strictEqual(visibleDescriptor.configurable, false);
	});

	it('should set accuracy to internal chain data', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, accuracyComposer(suitest, data, chain, makeChain));

		chain.accuracy(ACCURACY.LOW);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {accuracy: ACCURACY.LOW});
	});

	it('accuracy getter should get accuracy from internal chain data', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, accuracyComposer(suitest, data, chain, makeChain));

		chain.accuracy(ACCURACY.LOW);

		const accuracy = getAccuracy(makeChain.firstCall.args[0]);

		assert.strictEqual(accuracy, ACCURACY.LOW);
	});

	it('should throw error when accuracy method called with wrong arguments', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, accuracyComposer(suitest, data, chain, makeChain));

		const accuracyShouldBeString =
			suitestInvalidInputError('Invalid input provided for .accuracy function. Accuracy should be string');

		assert.throws(() => chain.accuracy(null), accuracyShouldBeString);
		assert.throws(() => chain.accuracy(undefined), accuracyShouldBeString);
		assert.throws(() => chain.accuracy(2), accuracyShouldBeString);
		assert.throws(() => chain.accuracy({}), accuracyShouldBeString);
		assert.throws(() => chain.accuracy([]), accuracyShouldBeString);

		const accuracyShouldBeOneOfValues =
			suitestInvalidInputError('Invalid input provided for .accuracy function. Accuracy should be equal to one of the allowed values: "high", "medium", "low"');

		assert.throws(() => chain.accuracy(''), accuracyShouldBeOneOfValues);
		assert.throws(() => chain.accuracy('unknown'), accuracyShouldBeOneOfValues);
	});
});
