const assert = require('assert');
const makeChain = require('../../lib/utils/makeChain');

describe('makeChain util', () => {
	it('should create new chain with provided composers only', () => {
		const chain = makeChain(() => ([
			() => ({test: {value: 'test'}}),
		]), {});

		assert.strictEqual(chain.test, 'test');
	});

	it('should provide getComposers callback with current state of data', () => {
		let outputData;
		makeChain(data => {
			outputData = data;

			return [];
		}, {test: 0});

		assert.deepStrictEqual(outputData, {test: 0});
	});

	it('should provide composer with data, chain and function to create new chain', () => {
		let outputData, outputChain, outputMakeChane;
		const chain = makeChain(() => ([
			(data, chain, makeChain) => {
				outputData = data;
				outputChain = chain;
				outputMakeChane = makeChain;

				return {test: {value: () => makeChain({test: 1})}};
			},
			data => ({getData: {value: () => data}}), // helper
		]), {test: 0});

		assert.deepStrictEqual(outputData, {test: 0});
		assert.strictEqual(outputChain, chain);
		assert.strictEqual(typeof outputMakeChane, 'function');

		const chain2 = chain.test();

		assert.deepStrictEqual(chain2.getData(), {test: 1});
	});
});
