const assert = require('assert');

const configure = require('../../lib/commands/configure');
const SuitestError = require('../../lib/utils/SuitestError');
const {config, override} = require('../../config');
const assertThrowsAsync = require('../../lib/utils/assertThrowsAsync');

describe('confugure', () => {
	beforeEach(() => {
		override({});
	});

	after(async() => {
		override({});
	});

	it('should throw correct error on invalid json schema', async() => {
		await assertThrowsAsync(
			async() => await configure({invalid: true}),
			err => err instanceof SuitestError && err.code === SuitestError.INVALID_INPUT,
		);
		await assertThrowsAsync(
			async() => await configure({
				useSentry: true,
				additionalProp: true,
			}),
			err => err instanceof SuitestError && err.code === SuitestError.INVALID_INPUT,
		);
		await assertThrowsAsync(
			async() => await configure({
				logLevel: 'unknownLevel',
			}),
			err => err instanceof SuitestError && err.code === SuitestError.INVALID_INPUT,
		);
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
