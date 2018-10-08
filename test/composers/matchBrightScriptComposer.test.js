const assert = require('assert');
const sinon = require('sinon');
const {matchBrightScriptComposer} = require('../../lib/composers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('Match BrightScript Composer', () => {
	it('should provide .matchBrightScript and .matchesBrightScript methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchBrightScriptComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.matchBrightScript, 'function');
		assert.strictEqual(typeof chain.matchesBrightScript, 'function');

		const matchBrightScriptDescriptor = Object.getOwnPropertyDescriptor(chain, 'matchBrightScript');
		const matchesBrightScriptDescriptor = Object.getOwnPropertyDescriptor(chain, 'matchesBrightScript');

		assert.strictEqual(matchBrightScriptDescriptor.enumerable, true);
		assert.strictEqual(matchBrightScriptDescriptor.writable, false);
		assert.strictEqual(matchBrightScriptDescriptor.configurable, false);

		assert.strictEqual(matchesBrightScriptDescriptor.enumerable, true);
		assert.strictEqual(matchesBrightScriptDescriptor.writable, false);
		assert.strictEqual(matchesBrightScriptDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, matchBrightScriptComposer(data, chain, makeChain));

		chain.matchBrightScript('test');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {
			comparator: {
				type: SUBJ_COMPARATOR.MATCH_BS,
				val: 'test',
			},
		});

		testInputErrorSync(chain.matchBrightScript, [123]);
	});
});
