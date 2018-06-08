/**
 * Error specific to Suitest.
 *
 * If user catches this error he would know it's something with Suitest:
 * - User entered bad data to one of Suitest methods.
 * - User called to something he has no access to (like connect to device before logging in).
 * - Suitest server returned error response.
 *
 * Network problems are not SuitestError, use native nodejs Error with proper code.
 */

const isSuitestMethod = require('./isSuitestMethod');
const {fetchSource} = require('./stackTraceParser');
const {unknownError} = require('./../texts');

const suitestErrorType = 'SuitestError';
const errorStackLineRegexp = RegExp(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);

class SuitestError extends Error {
	constructor(message, code) {
		super(message);

		this.name = SuitestError.name;
		this.code = code || SuitestError.UNKNOWN_ERROR;
		this.type = suitestErrorType; // suitest errors identifyer
		if (this.code === SuitestError.UNKNOWN_ERROR && !this.message) {
			this.message = unknownError();
		}

		this.stack = stripSuitestCodeFromStack(this);
	}

	exit(code = 1) {
		console.error(this.stack);
		process.exit(code);
	}

	get info() {
		return {
			source: fetchSource(this),
		};
	}
}

/**
 * Filter error stack from lines in suitest code
 * @param {Error} error
 * @returns {String}
 */
function stripSuitestCodeFromStack(error) {
	const lines = error.stack
		.split('\n')
		.filter(l => errorStackLineRegexp.test(l))
		.join('\n');

	const updatedLines = lines
		.split('\n')
		.filter(l => !isSuitestMethod(l))
		.join('\n');

	return error.stack.replace(lines, updatedLines);
}

// Assign error codes as static values
// Make it a static assignment to allow for better IDE support
SuitestError.AUTH_NOT_ALLOWED = Symbol('authNotAllowed');
SuitestError.AUTH_FAILED = Symbol('authFailed');
SuitestError.INVALID_INPUT = Symbol('invalidInput');
SuitestError.SERVER_ERROR = Symbol('serverError');
SuitestError.UNKNOWN_ERROR = Symbol('unknownError');
SuitestError.WS_ERROR = Symbol('webSocketsError');

module.exports = SuitestError;
