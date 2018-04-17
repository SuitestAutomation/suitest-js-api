const assert = require('assert');

/**
 * Helper for testing async functions. Utilizes original node assert.throws.
 * @param {Function} fn async function
 * @param {any} regExp error regExp
 */
async function assertThrowsAsync(fn, regExp) {
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
