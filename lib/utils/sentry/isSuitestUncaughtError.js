/**
 * Investigate raven error data.
 * Error should not be reported if its not from suitest api code and not of defined SuitestError type
 */

const isSuitestMethod = require('../isSuitestMethod');

/**
 * @param {*} ravenException
 * @returns boolean
 */
function isSuitestUncaughtError(ravenException) {
	return ravenException.type !== 'SuitestError' // error is not of SuitestError type
		&& ravenException.stacktrace.frames.some(fr => isSuitestMethod(fr.function)); // but error occured within suitest api code
}

module.exports = isSuitestUncaughtError;
