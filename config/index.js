/* istanbul ignore file */

/**
 * File coverage is ignored because unit tests for RC files keep failing if there is RC file on dev machine.
 * Need a cleaner way to test it, with mocks for RC lib.
 * Individual functions from utils are still covered in scope of those file's tests.
 */

const fs = require('fs');
const rc = require('rc');

const envVars = require('../lib/constants/enviroment');
const logLevels = require('../lib/constants/logLevels');
const timestamp = require('../lib/constants/timestamp');
const {validate, validators} = require('../lib/validataion');
const {invalidConfigObj, invalidUserConfig} = require('../lib/texts');
const {ENV_VARS} = require('../lib/mappings');
const {pickNonNil} = require('../lib/utils/common');
const SuitestError = require('../lib/utils/SuitestError');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';
const DEFAULT_TIMEOUT = 2000;

const configFields = [
	{
		name: 'logLevel',
		type: 'string',
	},
	{
		name: 'disallowCrashReports',
		type: 'bool',
	},
	{
		name: 'continueOnFatalError',
		type: 'bool',
	},
	{
		name: 'timestamp',
		type: 'string',
	},
	{
		name: 'defaultTimeout',
		type: 'number',
	},
];

const configFieldNames = configFields.map(({name}) => name);

const launcherFields = [
	'tokenKey', 'tokenPassword', 'testPackId', 'concurrency', // launcher automated
	'username', 'password', 'orgId', 'deviceId', 'appConfigId', 'inspect', 'inspectBrk', // launcher intaractive
	'logDir', 'timestamp', 'config', // launcher common
];
const allFields = [...configFieldNames, ...launcherFields];

const main = {
	apiUrl: 'https://the.suite.st/api/public/v2',
	continueOnFatalError: false,
	disallowCrashReports: false,
	logLevel: logLevels.normal,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: DEFAULT_TIMEOUT,
	wsUrl: 'wss://the.suite.st/api/public/v2/socket',
};

const test = {
	apiUrl: 'https://localhost',
	continueOnFatalError: false,
	disallowCrashReports: false,
	logLevel: logLevels.debug,
	sentryDsn,
	timestamp: timestamp.default,
	defaultTimeout: DEFAULT_TIMEOUT,
	wsUrl: 'ws://localhost:3000/',
};

Object.freeze(main);
Object.freeze(test);

const userConfigFile = process.env[envVars.SUITEST_USER_CONFIG];

const defaultConfig = global._suitestTesting ? test : main;
const rcConfig = readRcConfig();
const userConfig = userConfigFile ? readUserConfig(userConfigFile) : {};
const envConfig = pickConfigFieldsFromEnvVars(configFields);

const config = {};

extend(defaultConfig); // extend with default config
override(rcConfig); // extend with rc file
override(userConfig); // extend with user config file
extend(envConfig); // extend with env vars

const launcherParams = pickNonNil(launcherFields, rcConfig);

/**
 * Override config object
 * @param {Object} overrideObj
 */
function override(overrideObj = {}) {
	const _overrideObj = pickNonNil(allFields, overrideObj);

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
 * Read josn config file provided by user.
 * @param {string} path - path to config file
 * @throws {SuitestError}
 * @returns {Object} - parsed json
 */
function readUserConfig(path) {
	try {
		return JSON.parse(fs.readFileSync(path));
	} catch (error) {
		throw new SuitestError(invalidUserConfig(path, error.message), error.code);
	}
}

/**
 * Pick config fields from process.env
 * @param {Array<{name: string, type: string}>} configFields
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
					out[name] = parseInt(val, 10);
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
	readUserConfig,

	// for testing
	pickConfigFieldsFromEnvVars,
};
