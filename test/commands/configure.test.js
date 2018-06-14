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
		const defaultDieOnFatalError = config.dieOnFatalError;

		await configure({
			disallowCrashReports: !defaultSentryUse,
			dieOnFatalError: !defaultDieOnFatalError,
			logLevel: 'verbose',
		});
		assert.deepEqual(config, {
			...config,
			disallowCrashReports: !defaultSentryUse,
			dieOnFatalError: !defaultDieOnFatalError,
			logLevel: 'verbose',
		}, 'config updated');
	});
});
