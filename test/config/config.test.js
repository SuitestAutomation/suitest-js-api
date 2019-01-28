const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');

const config = require('../../config/index');
const envVars = require('../../lib/constants/enviroment');
const SuitestError = require('../../lib/utils/SuitestError');

describe('config', () => {
	it('should provide pickConfigFieldsFromEnvVars method', () => {
		const logLevel = process.env[envVars.SUITEST_CONFIG_LOG_LEVEL];
		const disallowCrashReports = process.env[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS];
		const continueOnFatalError = process.env[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR];

		process.env[envVars.SUITEST_CONFIG_LOG_LEVEL] = 'verbose';
		process.env[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS] = 'false';
		process.env[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR] = 'true';

		const configFields = config
			.pickConfigFieldsFromEnvVars([
				{
					name: 'logLevel',
					type: 'string'
				},
				{
					name: 'disallowCrashReports',
					type: 'bool'
				},
				{
					name: 'continueOnFatalError',
					type: 'bool'
				},
				{
					name: 'timestamp',
					type: 'string'
				},
				{
					name: 'defaultTimeout',
					type: 'number'
				}
			]);

		assert.deepEqual(configFields, {
			logLevel: 'verbose',
			disallowCrashReports: false,
			continueOnFatalError: true,
		});

		process.env[envVars.SUITEST_CONFIG_LOG_LEVEL] = logLevel;
		process.env[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS] = disallowCrashReports;
		process.env[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR] = continueOnFatalError;
	});

	it('readUserConfig method should process config file correctly', () => {
		const configObj = {test: true};

		sinon.stub(fs, 'readFileSync').returns(JSON.stringify(configObj));

		try {
			assert.deepEqual(config.readUserConfig(''), configObj, 'parsed successfully');
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readUserConfig method should throw correct errors', () => {
		assert.throws(
			() => config.readUserConfig('./__non-such-dir__/__non-such-file__.json'),
			err => err.type === SuitestError.type,
			'falied to read file'
		);

		sinon.stub(fs, 'readFileSync').returns('invalid json');

		try {
			assert.throws(
				() => config.readUserConfig(''),
				err => err.type === SuitestError.type,
				'falied to parse json'
			);
		} finally {
			fs.readFileSync.restore();
		}
	});
});

