/**
 * Investigate raven error data.
 * Error should not be reported if its not from suitest api code and not of defined SuitestError type
 */

const {ASSERTION_ERROR_TYPE} = require('../../constants');
const SuitestError = require('../SuitestError');
const isSuitestMethod = require('../isSuitestMethod');

/**
 * @param {*} ravenException
 * @returns boolean
 */
function isSuitestUncaughtError(ravenException) {
	return ravenException.type !== SuitestError.type // error is not SuitestError
		&& ravenException.type !== ASSERTION_ERROR_TYPE // error is not node native AssertionError
		&& ravenException.stacktrace.frames.some(fr => isSuitestMethod(fr.filename)); // but error occured within suitest api code
}

module.exports = isSuitestUncaughtError;
