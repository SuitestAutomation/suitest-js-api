const {pick} = require('ramda');
const logLevels = require('../lib/constants/logLevels');
const {readRcConfig} = require('../lib/utils/testLauncherHelper');
const {validate, validators} = require('../lib/validataion');
const {invalidConfigObj} = require('../lib/texts');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';
const overridableFields = [
	'logLevel', 'useSentry',
	'tokenKey', 'tokenPassword', 'testPackId',
	'username', 'password', 'orgId', 'deviceId', 'appConfigId',
];

const main = {
	apiUrl: 'https://the.suite.st/api/public/v2',
	sentryDsn,
	useSentry: true,
	wsUrl: 'wss://the.suite.st/api/public/v2/socket',
	logLevel: logLevels.normal,
};

const test = {
	apiUrl: 'https://localhost',
	sentryDsn,
	useSentry: true,
	wsUrl: 'ws://localhost:3000/',
	logLevel: logLevels.debug,
};

Object.freeze(main);
Object.freeze(test);

const config = {...(global._suitestTesting ? test : main)};

/**
 * Override config object
 * @param {Object} overrideObj
 */
function override(overrideObj = {}) {
	const _overrideObj = pick(overridableFields, overrideObj);

	validate(validators.CONFIGURE, _overrideObj, invalidConfigObj());

	Object.assign(config, _overrideObj);
}

// override lib config with user config from .suitestrc
override(readRcConfig());

module.exports = {
	config,
	override,
};
