const {API_CONSTRUCTOR_NAME, API_LIB_PATH_IDENTIFIERS} = require('../../lib/constants');
const path = require('path');

/**
 * Check whether function is method of suitest api by its stack line
 * @param {string} line
 * @returns boolean
 */
function isSuitestMethod(line) {
	if (!line) {
		return false;
	}

	const normalizedPaths = API_LIB_PATH_IDENTIFIERS.map(i => path.normalize(i));
	const normalizedLine = path.normalize(line);

	return normalizedLine.includes(API_CONSTRUCTOR_NAME) || normalizedPaths.some(i => normalizedLine.includes(i));
}

module.exports = isSuitestMethod;
