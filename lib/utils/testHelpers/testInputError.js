const assert = require('assert');
const assertThrowsAsync = require('../assertThrowsAsync');
const SuitestError = require('../SuitestError');

module.exports = (fn, args = [], expect = {}, msg) => {
	return assertThrowsAsync(fn.bind(fn, ...args), {
		type: 'SuitestError',
		code: SuitestError.INVALID_INPUT,
		...expect,
	}, msg || `Invalid error if ${args.length ? args.map(JSON.stringify).join(', ') : 'no args'}`);
}
