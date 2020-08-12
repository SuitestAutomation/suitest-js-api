const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {untilComposer} = require('../../lib/composers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Until Composer', () => {
	it('should provide .until method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, untilComposer(suitest, data, chain, makeChain));

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

		Object.defineProperties(chain, untilComposer(suitest, data, chain, makeChain));

		chain.until(conditionChain);

		assert.deepStrictEqual(makeChain.firstCall.args[0], {until: {subject: {type: 'application'}}});
	});

	it('should throw invalid input error in case not allowed chains are provided', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, untilComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.until, [], {message: 'Until condition expects a chain as an input parameter'});
		testInputErrorSync(chain.until, [{
			toJSON: () => ({request: {condition: {subject: {type: 'invalid'}}}}),
		}], {message: 'Invalid input Until condition chain requires valid modifier and should be one of the following types:\n' +
			'.application() .cookie() .element() .jsExpression() .location() .networkRequest() .video()'});
		testInputErrorSync(chain.until, [{
			toJSON: () => ({request: {}}),
		}], {message: 'Invalid input Until condition chain requires valid modifier and should be one of the following types:\n' +
			'.application() .cookie() .element() .jsExpression() .location() .networkRequest() .video()'});

		// must not throw any error
		chain.until({
			toJSON: () => ({request: {condition: {subject: {type: 'video'}}}}),
		});
	});
});
