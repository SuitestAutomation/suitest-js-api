/* istanbul ignore file */

/**
 * Configure raven sentry reporting
 */

const Raven = require('raven');
const {config} = require('../../../config');
const isSuitestUncaughtError = require('./isSuitestUncaughtError');

let isSetup = false;

if (!isSetup) {
	Raven
		.config(config.sentryDsn, {
			autoBreadcrumbs: {
				'console': false, // console logging
				'http': false, // rest requests (during unit testing, nock disables some requests)
			},
			captureUnhandledRejections: false,
			shouldSendCallback(data) {
				// send report if enabled in config and only uncaught suitest api errors
				return !config.disallowCrashReports && isSuitestUncaughtError(data.exception[0]);
			},
		})
		.install(err => {
			isSetup = !!err;
		});
}

/**
 * Explicitly capture provided exception
 * @param {Error} error
 * @returns {Promise<*>}
 */
function captureException(error) {
	return new Promise(res => Raven.captureException(error, res));
}

module.exports = {
	captureException,
};
