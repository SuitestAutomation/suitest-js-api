const {pick} = require('ramda');
const logLevels = require('../lib/constants/logLevels');
const {pickConfigFieldsFromEnvVars} = require('../lib/utils/testLauncherHelper');
const rc = require('rc');
const {validate, validators} = require('../lib/validataion');
const {invalidConfigObj} = require('../lib/texts');
const {SUITEST_LAUNCHER_PROCESS} = require('../lib/constants/enviroment');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';

let suitestPath = module.parent;

while (suitestPath && !/suitest$/.test(suitestPath.filename)) {
	suitestPath = suitestPath.parent;
}
if (process.env[SUITEST_LAUNCHER_PROCESS] !== 'child') {
	if (suitestPath) {
		process.env[SUITEST_LAUNCHER_PROCESS] = 'main';
	} else {
		process.env[SUITEST_LAUNCHER_PROCESS] = 'lib';
	}
}

const configFields = ['logLevel', 'disallowCrashReports', 'continueOnFatalError'];
const launcherFields = [
	'tokenKey', 'tokenPassword', 'testPackId', 'concurrency', // launcher automated
	'username', 'password', 'orgId', 'deviceId', 'appConfigId', 'inspect', 'inspectBrk', // launcher intaractive
	'logDir', // launcher common
];

const main = {
	apiUrl: 'https://the.suite.st/api/public/v2',
	continueOnFatalError: false,
	disallowCrashReports: false,
	logLevel: logLevels.normal,
	sentryDsn,
	wsUrl: 'wss://the.suite.st/api/public/v2/socket',
};

const test = {
	apiUrl: 'https://localhost',
	continueOnFatalError: false,
	disallowCrashReports: false,
	logLevel: logLevels.debug,
	sentryDsn,
	wsUrl: 'ws://localhost:3000/',
};

Object.freeze(main);
Object.freeze(test);

const rcConfig = readRcConfig();
const envConfig = pickConfigFieldsFromEnvVars(configFields);

const config = {
	...(global._suitestTesting ? test : main),
	...validate(validators.CONFIGURE, pick(configFields, rcConfig), invalidConfigObj()), // extend with rc file
	...envConfig, // extend with env vars
};

const launcherParams = pick(launcherFields, rcConfig);

/**
 * Override config object
 * Only used in .configure() command which is going to be depricated
 * @param {Object} overrideObj
 */
function override(overrideObj = {}) {
	const _overrideObj = pick(configFields, overrideObj);

	validate(validators.CONFIGURE, _overrideObj, invalidConfigObj());

	Object.assign(config, _overrideObj);
}

/**
 * Read `.suitestrc` launcher config file.
 * If file not found, return empty object.
 * Supports json and ini formats.
 * cli arguments are not parsed.
 * If file found, but json ivalid, throw error.
 */
function readRcConfig() {
	return rc('suitest', {}, () => ({}));
}

module.exports = {
	config,
	launcherParams,
	override,
	readRcConfig,
};
