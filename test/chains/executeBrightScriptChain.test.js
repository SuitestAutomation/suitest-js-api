const assert = require('assert');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	executeBrightScript,
	executeBrightScriptAssert,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/executeBrightScriptChain');
const sinon = require('sinon');

/**
 * This test is sort of high level, more like integration test
 * however it's compliant to BDD principles because of this.
 * We don't care about implementation details, we need code to do what we want
 */
describe('Execute brightscript chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = executeBrightScript('1+1');

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.clone, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after matchBrightScript is applied', () => {
		const chain = executeBrightScript('1+1').abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(executeBrightScript('1+1').toString(), 'Executing BrightScript:\n1+1');
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');

		beforeSendMsg('1+1');
		assert.ok(log.firstCall.args[0], 'beforeSendMsg exists');
		log.restore();
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(executeBrightScript, []);
		testInputErrorSync(executeBrightScript, [1]);
		testInputErrorSync(executeBrightScript, ['']);
		testInputErrorSync(executeBrightScript, [function() {
			return 1 + 1;
		}]);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			command: '1+1',
		}), {
			type: 'testLine',
			request: {
				type: 'execBRSCmd',
				val: '1+1',
			},
		}, 'type testLine');
		assert.deepStrictEqual(toJSON({
			command: '1+1',
		}), {
			type: 'eval',
			request: {
				type: 'execBRSCmd',
				val: '1+1',
			},
		}, 'type eval');
	});

	it('should define assert function', () => {
		const chain = executeBrightScriptAssert('1+1');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
