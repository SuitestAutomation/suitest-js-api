/* istanbul ignore file */

const {curry} = require('ramda');
const assert = require('assert');
const assertThrowsAsync = require('../assertThrowsAsync');
const SuitestError = require('../SuitestError');

const commonTestInputError = curry((asserter, fn, args = [], expect = {}, msg) => {
	return asserter(fn.bind(fn, ...args), {
		type: SuitestError.type,
		code: SuitestError.INVALID_INPUT,
		...expect,
	}, msg || `Invalid error if ${args.length ? args.map(JSON.stringify).join(', ') : 'no args'}`);
});

const suitestInvalidInputError = (message) => {
	return new SuitestError(message, SuitestError.INVALID_INPUT);
};

/**
 * @deprecated use assert.rejects and suitestInvalidInputError  https://nodejs.org/api/assert.html#assertrejectsasyncfn-error-message
 * @example
 * // Before:
 * await testInputErrorAsync(testingFunc, ['some arg']);
 * await testInputErrorAsync(testingFunc, ['some arg'] {message: 'Error message'});
 * // After:
 * await assert.rejects(() => testingFunc('some arg'));
 * await assert.rejects(() => testingFunc('some arg'), suitestInvalidInputError('Error message'));
 */
module.exports.testInputErrorAsync = commonTestInputError(assertThrowsAsync);
/**
 * @deprecated use assert.throws instead https://nodejs.org/api/assert.html#assertthrowsfn-error-message
 * @example
 * // Before:
 * await testInputErrorSync(testingFunc, ['some arg']);
 * await testInputErrorSync(testingFunc, ['some arg'], {message: 'Error message'});
 * // After:
 * await assert.throws(() => testingFunc('some arg'));
 * await assert.throws(() => testingFunc('some arg'), suitestInvalidInputError('Error message'));
 */
module.exports.testInputErrorSync = commonTestInputError(assert.throws);
module.exports.suitestInvalidInputError = suitestInvalidInputError;
