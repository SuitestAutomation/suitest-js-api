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
		const defaultSentryUse = config.disallowCrashReports;

		await configure({
			disallowCrashReports: !defaultSentryUse,
			logLevel: 'verbose',
		});
		assert.deepEqual(config, {
			...config,
			disallowCrashReports: !defaultSentryUse,
			logLevel: 'verbose',
		}, 'config updated');
	});
});
