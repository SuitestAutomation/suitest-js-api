const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {matchJSComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Match JS Composer', () => {
	it('should provide .matchJS and .matchesJS methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchJSComposer(suitest, data, chain, makeChain));

		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');

		const matchJSDescriptor = Object.getOwnPropertyDescriptor(chain, 'matchJS');
		const matchesJSDescriptor = Object.getOwnPropertyDescriptor(chain, 'matchesJS');

		assert.strictEqual(matchJSDescriptor.enumerable, true);
		assert.strictEqual(matchJSDescriptor.writable, false);
		assert.strictEqual(matchJSDescriptor.configurable, false);

		assert.strictEqual(matchesJSDescriptor.enumerable, true);
		assert.strictEqual(matchesJSDescriptor.writable, false);
		assert.strictEqual(matchesJSDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchJSComposer(suitest, data, chain, makeChain));

		chain.matchJS('test');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH_JS,
				val: 'test',
			},
		});

		testInputErrorSync(chain.matchJS, [123]);
	});
});
