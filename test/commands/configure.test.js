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
			dieOnFatalError: false,
			logLevel: 'verbose',
		});
		assert.deepEqual(config, {
			...config,
			disallowCrashReports: true,
			dieOnFatalError: false,
			logLevel: 'verbose',
		}, 'config updated');
	});
});
