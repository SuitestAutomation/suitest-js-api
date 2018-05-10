const assert = require('assert');

const configure = require('../../lib/commands/configure');
const {config, override} = require('../../config');

describe('confugure', () => {
	beforeEach(() => {
		override({});
	});

	after(async() => {
		override({});
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
