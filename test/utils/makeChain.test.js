const assert = require('assert');
const makeChain = require('../../lib/utils/makeChain');
const suitest = require('../../index');

describe('makeChain util', () => {
	it('should create new chain with provided composers only', () => {
		const chain = makeChain(suitest, () => ([
			() => ({test: {value: 'test'}}),
		]), {});

		assert.strictEqual(chain.test, 'test');
	});

	it('should provide getComposers callback with current state of data', () => {
		let outputData;
		makeChain(suitest, data => {
			outputData = data;

			return [];
		}, {test: 0});

		assert.deepStrictEqual(outputData, {
			test: 0,
			stack: outputData.stack,
		});
	});

	it('should provide composer with data, chain and function to create new chain', () => {
		let outputData, outputChain, outputMakeChane;
		const chain = makeChain(suitest, () => ([
			(suitest, data, chain, makeChain) => {
				outputData = data;
				outputChain = chain;
				outputMakeChane = makeChain;

				return {test: {value: () => makeChain({test: 1})}};
			},
			(_, data) => ({getData: {value: () => data}}), // helper
		]), {test: 0});

		assert.deepStrictEqual(outputData, {
			test: 0,
			stack: outputData.stack,
		});
		assert.strictEqual(outputChain, chain);
		assert.strictEqual(typeof outputMakeChane, 'function');

		const chain2 = chain.test();

		assert.strictEqual(chain2.getData().test, 1);
	});
});
