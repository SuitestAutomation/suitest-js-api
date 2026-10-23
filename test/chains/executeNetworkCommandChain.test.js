const assert = require('assert').strict;
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	executeNetworkCommand,
	executeNetworkCommandAssert,
	toJSON,
	getComposers,
} = require('../../lib/chains/executeNetworkCommandChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');

describe('Execute network command chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepEqual(
			getComposerTypes(getComposers({})),
			[
				composers.TO_STRING,
				composers.THEN,
				composers.ABANDON,
				composers.ASSERT,
				composers.CLONE,
				composers.GETTERS,
				composers.TO_JSON,
			].sort(bySymbol),
			'clear state',
		);

		assert.deepEqual(
			getComposerTypes(getComposers({isAbandoned: true})),
			[
				composers.TO_STRING,
				composers.THEN,
				composers.ASSERT,
				composers.CLONE,
				composers.GETTERS,
				composers.TO_JSON,
			].sort(bySymbol),
			'abandoned chain',
		);

		assert.deepEqual(
			getComposerTypes(getComposers({isAssert: true})),
			[
				composers.TO_STRING,
				composers.THEN,
				composers.ABANDON,
				composers.CLONE,
				composers.GETTERS,
				composers.TO_JSON,
			].sort(bySymbol),
			'assert chain',
		);

		const chain = executeNetworkCommand({downloadBytesPerSec: 50000, uploadBytesPerSec: 50000});

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepEqual(
			toJSON({downloadBytesPerSec: 50000, uploadBytesPerSec: null}),
			{
				type: 'eval',
				request: {
					type: 'throttleNetwork',
					downloadBytesPerSec: 50000,
					uploadBytesPerSec: null,
				},
			},
			'throttle network eval json message',
		);

		assert.deepEqual(
			toJSON({isAssert: true, downloadBytesPerSec: 0, uploadBytesPerSec: 0}),
			{
				type: 'testLine',
				request: {
					type: 'throttleNetwork',
					downloadBytesPerSec: 0,
					uploadBytesPerSec: 0,
				},
			},
			'throttle network assert json message',
		);
	});

	it('should pass the rates from the argument to the socket message', () => {
		assert.deepEqual(
			executeNetworkCommand({downloadBytesPerSec: 180000, uploadBytesPerSec: 84375}).toJSON().request,
			{
				type: 'throttleNetwork',
				downloadBytesPerSec: 180000,
				uploadBytesPerSec: 84375,
			},
		);
	});

	it('should describe the line', () => {
		assert.strictEqual(
			executeNetworkCommand({downloadBytesPerSec: 50000, uploadBytesPerSec: null}).toString(),
			'|E|Throttle network\n'
			+ '  Download = \x1B[4m400 Kbit/s\x1B[0m\n'
			+ '  Upload   = \x1B[4mno limit\x1B[0m  ',
		);
		assert.strictEqual(
			executeNetworkCommandAssert({downloadBytesPerSec: 0, uploadBytesPerSec: 0}).toString(),
			'|A|Throttle network\n'
			+ '  Download = \x1B[4moffline\x1B[0m\n'
			+ '  Upload   = \x1B[4moffline\x1B[0m',
		);
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(executeNetworkCommand, []);
		testInputErrorSync(executeNetworkCommand, [null]);
		testInputErrorSync(executeNetworkCommand, [50000]);
		testInputErrorSync(executeNetworkCommand, [{}]);
		testInputErrorSync(executeNetworkCommand, [{downloadBytesPerSec: 50000}]);
		testInputErrorSync(executeNetworkCommand, [{downloadBytesPerSec: '50000', uploadBytesPerSec: 50000}]);
		testInputErrorSync(executeNetworkCommand, [{downloadBytesPerSec: -1, uploadBytesPerSec: 50000}]);
		testInputErrorSync(executeNetworkCommand, [{downloadBytesPerSec: 50000.5, uploadBytesPerSec: 50000}]);
		testInputErrorSync(executeNetworkCommand, [{downloadBytesPerSec: 50000, uploadBytesPerSec: 50000, profileName: '3G'}]);
	});

	it('should define assert function', () => {
		const chain = executeNetworkCommandAssert({downloadBytesPerSec: null, uploadBytesPerSec: null});

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
