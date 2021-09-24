/* istanbul ignore file */

/**
 * File coverage is ignored because unit tests for RC files keep failing if there is RC file on dev machine.
 * Need a cleaner way to test it, with mocks for RC lib.
 * Individual functions from utils are still covered in scope of those file's tests.
 */

const logLevels = require('../lib/constants/logLevels');
const timestamp = require('../lib/constants/timestamp');
const {validate, validators} = require('../lib/validation');
const {invalidConfigObj} = require('../lib/texts');
const {pickNonNil} = require('../lib/utils/common');
const envVars = require('../lib/constants/enviroment');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';
const DEFAULT_TIMEOUT = 2000;

const overridableFields = [
	'tokenId', 'tokenPassword', 'concurrency', 'preset', 'presets', 'deviceId', 'appConfigId', 'inspect', 'inspectBrk',
	'logLevel', 'logDir', 'timestamp', 'configFile', 'disallowCrashReports', 'defaultTimeout', 'screenshotDir',
	'includeChangelist',
];

const configurableFields = ['logLevel', 'disallowCrashReports', 'defaultTimeout'];

const serverPrefix = process.env[envVars.BE_SERVER] || 'the';

const main = Object.freeze({
	apiUrl: `https://${serverPrefix}.suite.st/api/public/v4`,
	disallowCrashReports: false,
	logLevel: logLevels.normal,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: DEFAULT_TIMEOUT,
	wsUrl: `wss://${serverPrefix}.suite.st/api/public/v4/socket`,
});

const test = Object.freeze({
	apiUrl: 'https://localhost',
	disallowCrashReports: true,
	logLevel: logLevels.debug,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: DEFAULT_TIMEOUT,
	wsUrl: 'ws://localhost:3000/',
});

const configFactory = () => {
	const config = {...(global._suitestTesting ? test : main)};

	/**
	 * Override config directly without user input validation
	 * Not to be used for user input
	 * @param ext
	 */
	function extend(ext) {
		Object.assign(config, ext);
	}

	/**
	 * Override config object
	 * @param {Object} overrideObj
	 */
	function override(overrideObj = {}) {
		const _overrideObj = pickNonNil(overridableFields, overrideObj);

		validate(validators.CONFIGURE, _overrideObj, invalidConfigObj());
		extend(_overrideObj);
	}

	return {
		config,
		overridableFields,
		configurableFields,
		extend,
		override,
	};
};

module.exports = {
	configFactory,
	// for testing
	...(global._suitestTesting ? test : main),
};
