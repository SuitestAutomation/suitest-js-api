const assert = require('assert');
const sinon = require('sinon');
const {untilComposer} = require('../../lib/composers');
const SuitestError = require('../../lib/utils/SuitestError');

describe('Until Composer', () => {
	it('should provide .until method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, untilComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.until, 'function');

		const equalDescriptor = Object.getOwnPropertyDescriptor(chain, 'until');

		assert.strictEqual(equalDescriptor.enumerable, true);
		assert.strictEqual(equalDescriptor.writable, false);
		assert.strictEqual(equalDescriptor.configurable, false);
	});

	it('should generate a new chain with until value', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();
		const conditionChain = {
			toJSON() {
				return {
					request: {
						condition: {subject: {type: 'application'}},
					},
				};
			},
		};

		Object.defineProperties(chain, untilComposer(data, chain, makeChain));

		chain.until(conditionChain);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {until: {subject: {type: 'application'}}});
	});

	it('should throw invalid input error in case not allowed chains are provided', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, untilComposer(data, chain, makeChain));

		assert.throws(() => chain.until({}), err => {
			return err instanceof SuitestError
				&& err.code === SuitestError.INVALID_INPUT
				&& err.message.includes('Until condition expects a chain as an input parameter');
		}, 'Until condition expects a chain as an input parameter');
		assert.throws(() => chain.until({
			toJSON: () => ({request: {condition: {subject: {type: 'invalid'}}}}),
		}), err => {
			return err instanceof SuitestError
				&& err.code === SuitestError.INVALID_INPUT
				&& err.message.includes(
					'Until condition chain requires valid modifier and should be one of the following types'
				);
		}, 'illegal condition chain type');
		assert.throws(() => chain.until({
			toJSON: () => ({request: {}}),
		}), err => {
			return err instanceof SuitestError
				&& err.code === SuitestError.INVALID_INPUT
				&& err.message.includes(
					'Until condition chain requires valid modifier and should be one of the following types'
				);
		}, 'no condition chain modifier');
	});
});
