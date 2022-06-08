/* istanbul ignore file */

/**
 * Configure raven sentry reporting
 */

const Raven = require('raven');
const isSuitestUncaughtError = require('./isSuitestUncaughtError');
const {version} = require('../../../package.json');

let isSetup = false;

const setUpRaven = (config, authContext) => {
	if (!isSetup && !config.disallowCrashReports) {
		Raven
			.config(config.sentryDsn, {
				release: version,
				dataCallback: data => {
					// Populate error report with type of user session
					data.user = {authType: authContext.context.toString()};

					return data;
				},
				autoBreadcrumbs: {
					'console': false, // console logging
					'http': false, // rest requests (during unit testing, nock disables some requests)
				},
				captureUnhandledRejections: false,
				shouldSendCallback(data) {
					// send report if enabled in config and only uncaught suitest api errors
					// and if message was sent

					return !config.disallowCrashReports && (
						data.extra.networkingError
						|| !data.exception
						|| isSuitestUncaughtError(data.exception[0])
					);
				},
			})
			.install(err => {
				isSetup = !!err;
			});
	}
};

/**
 * Explicitly capture provided exception
 * @param {Error} error
 * @param {Object} [extra]
 * @returns {Promise<*>}
 */
function captureException(error, extra) {
	return new Promise(res => Raven.captureException(error, extra, res));
}

/**
 * @description Send log message to sentry
 * @param {string} message
 * @param {object} kwargs
 * @returns {Promise<unknown>}
 */
function captureMessage(message, kwargs) {
	return new Promise(res => Raven.captureMessage(message, kwargs, res));
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
	captureMessage,
	wrapThrow,
	setUpRaven,
};
