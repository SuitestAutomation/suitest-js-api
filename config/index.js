const {pick} = require('ramda');
const logLevels = require('../lib/constants/logLevels');
const {readRcConfig} = require('../lib/utils/testLauncherHelper');
const {validate, validators} = require('../lib/validataion');
const {invalidConfigObj} = require('../lib/texts');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';

const rcConfigFields = ['logLevel', 'disallowCrashReports', 'continueOnFatalError'];
const rcLauncherFields = [
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

const config = {
	...(global._suitestTesting ? test : main),
	...validate(validators.CONFIGURE, pick(rcConfigFields, rcConfig), invalidConfigObj()),
};

const launcherParams = pick(rcLauncherFields, rcConfig);

/**
 * Override config object
 * Only used in .configure() command which is going to be depricated
 * @param {Object} overrideObj
 */
function override(overrideObj = {}) {
	const _overrideObj = pick(rcConfigFields, overrideObj);

	validate(validators.CONFIGURE, _overrideObj, invalidConfigObj());

	Object.assign(config, _overrideObj);
}

module.exports = {
	config,
	launcherParams,
	override,
};
