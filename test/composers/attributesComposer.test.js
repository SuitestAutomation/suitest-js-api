const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {attributesComposer} = require('../../lib/composers');

describe('Element attributes composer', () => {
	it('should provide .getAttributes method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, attributesComposer(suitest, data, chain, makeChain));

		const getAttributesDescriptor = Object.getOwnPropertyDescriptor(chain, 'getAttributes');

		assert.strictEqual(getAttributesDescriptor.enumerable, true);
		assert.strictEqual(getAttributesDescriptor.writable, false);
		assert.strictEqual(getAttributesDescriptor.configurable, false);
	});

	it('should generate a new chain with defined element attributes', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, attributesComposer(suitest, data, chain, makeChain));

		chain.getAttributes();
		assert.deepStrictEqual(makeChain.lastCall.args[0], {attributes: []});

		chain.getAttributes(['id']);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {attributes: ['id']});
	});

	it('should throw error in case of invalid input', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, attributesComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.getAttributes, ['str'], {}, 'string is invalid input');
		testInputErrorSync(chain.getAttributes, [1], {}, 'number is invalid input');
		testInputErrorSync(chain.getAttributes, [{}], {}, 'object is invalid input');
		testInputErrorSync(chain.getAttributes, [[1]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getAttributes, [[null]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getAttributes, [[true]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getAttributes, [[{}]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getAttributes, [['']], {}, 'array with empty string is invalid input');
	});
});
