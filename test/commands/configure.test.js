const assert = require('assert');

const configure = require('../../lib/commands/configure');
const {config, override} = require('../../config');
const testInputError = require('../../lib/utils/testHelpers/testInputError');

describe('confugure', () => {
	beforeEach(() => {
		override({});
	});

	after(async() => {
		override({});
	});

	it('should throw correct error on invalid input', async() => {
		await testInputError(configure, [{invalid: true}]);
		await testInputError(configure, [{
			useSentry: true,
			additionalProp: true,
		}]);
		await testInputError(configure, [{
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
