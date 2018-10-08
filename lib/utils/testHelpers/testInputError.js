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

module.exports.testInputErrorAsync = commonTestInputError(assertThrowsAsync);
module.exports.testInputErrorSync = commonTestInputError(assert.throws);
