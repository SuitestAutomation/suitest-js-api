/* istanbul ignore file */

/**
 * Configure sentry reporting
 */

const Sentry = require('@sentry/node');
const isSuitestUncaughtError = require('./isSuitestUncaughtError');
const {version} = require('../../../package.json');

let isSetup = false;

const setUpSentry = (config, authContext) => {
	if (!isSetup && !config.disallowCrashReports) {
		Sentry.init({
			dsn: config.sentryDsn,
			release: version,
			integrations(defaultIntegrations) {
				// Keep behavior compatible with old Raven setup:
				// - autoBreadcrumbs.console = false
				// - autoBreadcrumbs.http = false
				// - captureUnhandledRejections = false
				return defaultIntegrations.filter(integration => {
					return !['Console', 'Http', 'OnUnhandledRejection'].includes(integration.name);
				});
			},
			beforeSend(data) {
				// Populate error report with type of user session
				data.user = {authType: authContext.context.toString()};

				// send report if enabled in config and only uncaught suitest api errors
				// and if message was sent
				if (
					!config.disallowCrashReports
					&& (
						(data.extra && data.extra.networkingError)
						|| !data.exception
						|| (
							data.exception
							&& data.exception.values
							&& data.exception.values[0]
							&& isSuitestUncaughtError(data.exception.values[0])
						)
					)
				) {
					return data;
				}

				return null;
			},
		});
		isSetup = true;
	}
};

/**
 * Best-effort delivery for telemetry events.
 * We intentionally do not fail the main execution flow if Sentry is unavailable.
 */
function flush() {
	return Sentry.flush(2000)
		.catch(() => undefined);
}

/**
 * Explicitly capture provided exception
 * @param {Error} error
 * @param {Object} [extra]
 * @returns {Promise<unknown>}
 */
function captureException(error, extra) {
	Sentry.captureException(error, extra);

	// Keep async contract
	return flush();
}

/**
 * @description Send log message to sentry
 * @param {string} message
 * @param {object} kwargs
 * @returns {Promise<unknown>}
 */
function captureMessage(message, kwargs) {
	Sentry.captureMessage(message, kwargs);

	// Keep async contract
	return flush();
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
		 * Capturing Sentry exception is asynchronous.
		 * While this function has to be synchronous.
		 * If client's application does not catch this exception and node
		 * crashes - we'll not get the report.
		 * If client's application does catch an error an process it somehow
		 * (e.g. mocha), we'll receive an exception in Sentry
		 */
		Sentry.captureException(e);

		throw e;
	}
};

module.exports = {
	captureException,
	captureMessage,
	wrapThrow,
	setUpSentry,
};
