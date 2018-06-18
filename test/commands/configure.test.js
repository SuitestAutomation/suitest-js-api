const assert = require('assert');

const configure = require('../../lib/commands/configure');
const {config, override} = require('../../config');

const cachedConfig = {...config};

describe('confugure', () => {
	after(async() => {
		override(cachedConfig);
	});

	it('should set config ovverride', async() => {
		await configure({
			disallowCrashReports: true,
			continueOnFatalError: true,
			logLevel: 'verbose',
		});
		assert.deepEqual(config, {
			...config,
			disallowCrashReports: true,
			continueOnFatalError: true,
			logLevel: 'verbose',
		}, 'config updated');
	});
});
