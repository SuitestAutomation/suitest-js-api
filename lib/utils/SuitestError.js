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

const {fetchSource, stripSuitestCodeFromStack} = require('./stackTraceParser');
const {unknownError} = require('./../texts');
const {config} = require('../../config');
const logLevels = require('../constants/logLevels');

const suitestErrorType = 'SuitestError';

class SuitestError extends Error {
	/**
	 * @param {string} message
	 * @param {Symbol} code
	 * @param response
	 */
	constructor(message, code, response) {
		super(message);

		this.name = SuitestError.name;
		this.code = code || SuitestError.UNKNOWN_ERROR;
		this.type = suitestErrorType; // suitest errors identifyer
		if (this.code === SuitestError.UNKNOWN_ERROR && !this.message) {
			this.message = unknownError();
		}
		if (response) {
			this.response = response;
		}
		this.stack = config.logLevel === logLevels.debug ? this.stack : stripSuitestCodeFromStack(this.stack);
	}

	exit(code = 1, logger = console) {
		logger.error(this.stack);
		process.exit(code);
	}

	get info() {
		return {
			source: fetchSource(this),
		};
	}
}

SuitestError.type = suitestErrorType;

// Assign error codes as static values
// Make it a static assignment to allow for better IDE support
SuitestError.AUTH_NOT_ALLOWED = Symbol('authNotAllowed');
SuitestError.AUTH_FAILED = Symbol('authFailed');
SuitestError.INVALID_INPUT = Symbol('invalidInput');
SuitestError.SERVER_ERROR = Symbol('serverError');
SuitestError.UNKNOWN_ERROR = Symbol('unknownError');
SuitestError.WS_ERROR = Symbol('webSocketsError');
SuitestError.IPC_ERROR = Symbol('ipcError');
SuitestError.EVALUATION_ERROR = Symbol('evaluationError');

module.exports = SuitestError;
