const assert = require('assert');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const suitest = require('../../index');
const {
	executeCommand,
	executeCommandAssert,
	toJSON,
} = require('../../lib/chains/executeCommandChain')(suitest);

/**
 * This test is sort of high level, more like integration test
 * however it's compliant to BDD principles because of this.
 * We don't care about implementation details, we need code to do what we want
 */
describe('Execute command chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = executeCommand('1+1');

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.clone, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after abandon is applied', () => {
		const chain = executeCommand('1+1').abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should throw error in case of invalid input', () => {
		executeCommand(function() {
			return 1 + 1;
		});
		assert.ok(true, 'no error');

		testInputErrorSync(executeCommand, []);
		testInputErrorSync(executeCommand, [1]);
		testInputErrorSync(executeCommand, ['']);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			command: '1+1',
		}), {
			type: 'testLine',
			request: {
				type: 'execCmd',
				val: '1+1',
			},
		}, 'type testLine');
		assert.deepStrictEqual(toJSON({
			command: '1+1',
		}), {
			type: 'eval',
			request: {
				type: 'execCmd',
				val: '1+1',
			},
		}, 'type eval');
	});

	it('should define assert function', () => {
		const chain = executeCommandAssert('1+1');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
