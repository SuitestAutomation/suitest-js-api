/* istanbul ignore file */

/**
 * File coverage is ignored because unit tests for RC files keep failing if there is RC file on dev machine.
 * Need a cleaner way to test it, with mocks for RC lib.
 * Individual functions from utils are still covered in scope of those file's tests.
 */

const logLevels = require('../lib/constants/logLevels');
const timestamp = require('../lib/constants/timestamp');
const rc = require('rc');
const {validate, validators} = require('../lib/validataion');
const {invalidConfigObj} = require('../lib/texts');
const {ENV_VARS} = require('../lib/mappings');
const {pickNonNil} = require('../lib/utils/common');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';

const configFields = [
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
];

const launcherFields = [
	'tokenKey', 'tokenPassword', 'testPackId', 'concurrency', // launcher automated
	'username', 'password', 'orgId', 'deviceId', 'appConfigId', 'inspect', 'inspectBrk', // launcher intaractive
	'logDir', 'timestamp', // launcher common
];

const main = {
	apiUrl: 'https://the.suite.st/api/public/v2',
	continueOnFatalError: false,
	disallowCrashReports: false,
	logLevel: logLevels.normal,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: 2000,
	wsUrl: 'wss://the.suite.st/api/public/v2/socket',
};

const test = {
	apiUrl: 'https://localhost',
	continueOnFatalError: false,
	disallowCrashReports: false,
	logLevel: logLevels.debug,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: 2000,
	wsUrl: 'ws://localhost:3000/',
};

Object.freeze(main);
Object.freeze(test);

const rcConfig = readRcConfig();
const envConfig = pickConfigFieldsFromEnvVars(configFields);

const config = {
	...(global._suitestTesting ? test : main),
	...validate(validators.CONFIGURE, pickNonNil(configFields.map(({name}) => name), rcConfig), invalidConfigObj()), // extend with rc file
	...envConfig, // extend with env vars
};

const launcherParams = pickNonNil(launcherFields, rcConfig);

/**
 * Override config object
 * @param {Object} overrideObj
 */
function override(overrideObj = {}) {
	const _overrideObj = pickNonNil(configFields.map(({name})=>name), overrideObj);

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

/**
 * Read `.suitestrc` launcher config file.
 * If file not found, return empty object.
 * Supports json and ini formats.
 * cli arguments are not parsed.
 * If file found, but json invalid, throw error.
 */
function readRcConfig() {
	// ignore .suitestrc files when running unit tests
	if (global._suitestTesting)
		return {};

	return rc('suitest', {}, () => ({}));
}

/**
 * Pick config fields from process.env
 * @param {Array<string>} configFields
 * @returns {Object}
 */
function pickConfigFieldsFromEnvVars(configFields) {
	return configFields.reduce((out, {name, type}) => {

		if (ENV_VARS[name] in process.env) {
			const val = process.env[ENV_VARS[name]];

			switch (type) {
				case 'bool':
					out[name] = (val === 'true');
					break;
				case 'number':
					out[name] = parseInt(val);
					break;
				default:
					out[name] = val;
					break;
			}
		}

		return out;
	}, {});
}

module.exports = {
	config,
	launcherParams,
	override,
	extend,
	pickConfigFieldsFromEnvVars,
};
