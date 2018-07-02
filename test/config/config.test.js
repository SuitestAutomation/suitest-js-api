const assert = require('assert');
const config = require('../../config/index');
const envVars = require('../../lib/constants/enviroment');

describe('config', () => {
	it('should provide pickConfigFieldsFromEnvVars method', () => {
		const logLevel = process.env[envVars.SUITEST_CONFIG_LOG_LEVEL];
		const disallowCrashReports = process.env[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS];
		const continueOnFatalError = process.env[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR];

		process.env[envVars.SUITEST_CONFIG_LOG_LEVEL] = 'verbose';
		process.env[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS] = 'false';
		process.env[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR] = 'true';

		const configFields = config
			.pickConfigFieldsFromEnvVars(['logLevel', 'disallowCrashReports', 'continueOnFatalError']);

		assert.deepEqual(configFields, {
			logLevel: 'verbose',
			disallowCrashReports: false,
			continueOnFatalError: true,
		});

		process.env[envVars.SUITEST_CONFIG_LOG_LEVEL] = logLevel;
		process.env[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS] = disallowCrashReports;
		process.env[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR] = continueOnFatalError;
	});
});
