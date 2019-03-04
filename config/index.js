/* istanbul ignore file */

/**
 * File coverage is ignored because unit tests for RC files keep failing if there is RC file on dev machine.
 * Need a cleaner way to test it, with mocks for RC lib.
 * Individual functions from utils are still covered in scope of those file's tests.
 */

const logLevels = require('../lib/constants/logLevels');
const timestamp = require('../lib/constants/timestamp');
const {validate, validators} = require('../lib/validataion');
const {invalidConfigObj} = require('../lib/texts');
const {pickNonNil} = require('../lib/utils/common');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';
const DEFAULT_TIMEOUT = 2000;

const overridableFields = [
	'tokenKey', 'tokenPassword', 'testPackId', 'concurrency', // launcher automated
	'username', 'password', 'orgId', 'deviceId', 'appConfigId', 'inspect', 'inspectBrk', // launcher intaractive
	'logLevel', 'logDir', 'timestamp', 'configFile', 'continueOnFatalError', 'disallowCrashReports', 'defaultTimeout', // launcher common
];

const main = Object.freeze({
	apiUrl: 'https://the.suite.st/api/public/v3',
	continueOnFatalError: false,
	disallowCrashReports: false,
	logLevel: logLevels.normal,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: DEFAULT_TIMEOUT,
	wsUrl: 'wss://the.suite.st/api/public/v3/socket',
});

const test = Object.freeze({
	apiUrl: 'https://localhost',
	continueOnFatalError: false,
	disallowCrashReports: true,
	logLevel: logLevels.debug,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: DEFAULT_TIMEOUT,
	wsUrl: 'ws://localhost:3000/',
});

const config = {...(global._suitestTesting ? test : main)};

/**
 * Override config object
 * @param {Object} overrideObj
 */
function override(overrideObj = {}) {
	const _overrideObj = pickNonNil(overridableFields, overrideObj);

	validate(validators.CONFIGURE, _overrideObj, invalidConfigObj());
	extend(_overrideObj);
}

/**
 * Override config directly without user input validation
 * Not to be used for user input
 * @param ext
 */
function extend(ext) {
	Object.assign(config, ext);
}

module.exports = {
	config,
	override,
	overridableFields,
	extend,
};
