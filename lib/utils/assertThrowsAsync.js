const assert = require('assert');

/**
 * Helper for testing async functions. Utilizes original node assert.throws.
 * @param {Function} fn async function
 * @param {RegExp|Function|Object} regExp error
 * @param {string} msg message for the assertion
 */
async function assertThrowsAsync(fn, regExp, msg) {
	/* istanbul ignore next */
	let f = () => { /* empty */ };

	try {
		await fn();
	} catch (e) {
		f = () => {
			throw e;
		};
	} finally {
		assert.throws(f, regExp, msg);
	}
}

module.exports = assertThrowsAsync;
