/**
 * Investigate raven error data.
 * Error should not be reported if its not from suitest api code and not of defined SuitestError type
 */

const {AssertionError} = require('assert');
const SuitestError = require('../SuitestError');
const isSuitestMethod = require('../isSuitestMethod');

/**
 * @param {*} ravenException
 * @returns boolean
 */
function isSuitestUncaughtError(ravenException) {
	return ravenException.name !== SuitestError.name // error is not SuitestError
		&& ravenException.name !== AssertionError.name // error is not node native AssertionError
		&& ravenException.stacktrace.frames.some(fr => isSuitestMethod(fr.filename)); // but error occured within suitest api code
}

module.exports = isSuitestUncaughtError;
