/**
 * Converts function, provided by user to string.
 * Validates input.
 * @param {String|Function} input
 * @returns {string|null}
 */
function parseJS(input) {
	if (typeof input === 'string') {
		return input;
	}

	if (typeof input !== 'function')
		return null;

	return `(${input.toString()})()`;
}

module.exports = parseJS;
