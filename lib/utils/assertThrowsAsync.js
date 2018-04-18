const assert = require('assert');

/**
 * Helper for testing async functions. Utilizes original node assert.throws.
 * @param {Function} fn async function
 * @param {any} regExp error regExp
 * @param {string} error msg
 */
async function assertThrowsAsync(fn, regExp, msg) {
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
