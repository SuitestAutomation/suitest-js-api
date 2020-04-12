/* istanbul ignore file */

/**
 * Configure raven sentry reporting
 */

const Raven = require('raven');
const {config} = require('../../../config');
const isSuitestUncaughtError = require('./isSuitestUncaughtError');
const {version} = require('../../../package.json');
// const {authContext} = require('../../context');

let isSetup = false;

if (!isSetup && !config.disallowCrashReports) {
	Raven
		.config(config.sentryDsn, {
			release: version,
			dataCallback: data => {
				// Populate error report with type of user session
				// data.user = {authType: authContext.context.toString()}; // todo do we need this data???

				return data;
			},
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

/**
 * Sentry's implementation of wrap does not trow an exception
 * after it's reported. We need an error to be thrown to user.
 * @param {Function} callback
 * @returns {Function}
 */
const wrapThrow = callback => (...args) => {
	try {
		return callback.apply(undefined, args);
	} catch (e) {
		/*
		 * Capturing Raven exception is asynchronous.
		 * While this function has to be synchronous.
		 * If client's application does not catch this exception and node
		 * crashes - we'll not get the report.
		 * If client's application does catch an error an process it somehow
		 * (e.g. mocha), we'll receive an exception in Sentry
		 */
		Raven.captureException(e);

		throw e;
	}
};

module.exports = {
	captureException,
	wrapThrow,
};
