const logLevels = require('../lib/constants/logLevels');

const sentryDsn = 'https://1f74b885d0c44549b57f307733d60351:dd736ff3ac994104ab6635da53d9be2e@sentry.io/288812';

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
function override(overrideObj) {
	Object.assign(config, overrideObj);
}

module.exports = {
	config,
	override,
};
