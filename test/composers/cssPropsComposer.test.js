const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {cssPropsComposer} = require('../../lib/composers');

describe('CSS properties composer', () => {
	it('should provide .getCssProperties method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, cssPropsComposer(suitest, data, chain, makeChain));

		const getCssPropertiesDescriptor = Object.getOwnPropertyDescriptor(chain, 'getCssProperties');

		assert.strictEqual(getCssPropertiesDescriptor.enumerable, true);
		assert.strictEqual(getCssPropertiesDescriptor.writable, false);
		assert.strictEqual(getCssPropertiesDescriptor.configurable, false);
	});

	it('should generate a new chain with defined css properties', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, cssPropsComposer(suitest, data, chain, makeChain));

		chain.getCssProperties(['width', 'height']);

		assert.deepStrictEqual(
			makeChain.firstCall.args[0],
			{cssProps: ['width', 'height']},
		);
	});

	it('should throw error in case of invalid input', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, cssPropsComposer(suitest, data, chain, makeChain));

		testInputErrorSync(chain.getCssProperties, [], {}, 'undefined is invalid input');
		testInputErrorSync(chain.getCssProperties, ['str'], {}, 'string is invalid input');
		testInputErrorSync(chain.getCssProperties, [1], {}, 'number is invalid input');
		testInputErrorSync(chain.getCssProperties, [{}], {}, 'object is invalid input');
		testInputErrorSync(chain.getCssProperties, [[]], {}, 'empty array is invalid input');
		testInputErrorSync(chain.getCssProperties, [[1]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getCssProperties, [[null]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getCssProperties, [[true]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getCssProperties, [[{}]], {}, 'array with non strings is invalid input');
		testInputErrorSync(chain.getCssProperties, [['']], {}, 'array with empty string is invalid input');
	});
});
