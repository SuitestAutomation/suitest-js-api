const assert = require('assert');

/**
 * Helper for testing async functions. Utilizes original node assert.throws.
 * @param {Function} fn async function
 * @param {RegExp|Function|Object} regExp error
 */
async function assertThrowsAsync(fn, regExp) {
	/* istanbul ignore next */
	let f = () => { /* empty */ };

	try {
		await fn();
	} catch (e) {
		f = () => {
			throw e;
		};
	} finally {
		assert.throws(f, regExp);
	}
}

module.exports = assertThrowsAsync;
