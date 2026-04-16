/**
 * Investigate sentry error data.
 * Error should not be reported if its not from suitest api code and not of defined SuitestError type
 */

const {ASSERTION_ERROR_TYPE} = require('../../constants');
const SuitestError = require('../SuitestError');
const isSuitestMethod = require('../isSuitestMethod');

/**
 * @param {*} sentryError
 * @returns boolean
 */
function isSuitestUncaughtError(sentryError) {
	return sentryError.type !== SuitestError.type // error is not SuitestError
		&& sentryError.type !== ASSERTION_ERROR_TYPE // error is not node native AssertionError
		&& sentryError.stacktrace.frames.some(fr => isSuitestMethod(fr.filename)); // but error occurred within suitest api code
}

module.exports = isSuitestUncaughtError;
