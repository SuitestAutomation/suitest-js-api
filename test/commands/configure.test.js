const assert = require('assert');

const configure = require('../../lib/commands/configure');
const {config, override} = require('../../config');
const {testInputErrorAsync} = require('../../lib/utils/testHelpers/testInputError');

describe('confugure', () => {
	beforeEach(() => {
		override({});
	});

	after(async() => {
		override({});
	});

	it('should throw correct error on invalid input', async() => {
		await testInputErrorAsync(configure, [{invalid: true}]);
		await testInputErrorAsync(configure, [{
			useSentry: true,
			additionalProp: true,
		}]);
		await testInputErrorAsync(configure, [{
			logLevel: 'unknownLevel',
		}]);
	});

	it('should set config ovverride', async() => {
		const defaultSentryUse = config.useSentry;

		await configure({
			useSentry: !defaultSentryUse,
			logLevel: 'verbose',
		});
		assert.deepEqual(config, {
			...config,
			useSentry: !defaultSentryUse,
			logLevel: 'verbose',
		}, 'config updated');
	});
});
