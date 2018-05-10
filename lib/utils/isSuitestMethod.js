const {API_CONSTRUCTOR_NAME, API_LIB_PATH_IDENTIFIERS} = require('../../lib/constants');
const path = require('path');

/**
 * Check whether function is method of suitest api by its stack line
 * @param {string} line
 * @returns boolean
 */
function isSuitestMethod(line) {
	const apiLibPaths = API_LIB_PATH_IDENTIFIERS.map(i => path.normalize(i));

	return line && (line.includes(API_CONSTRUCTOR_NAME) || apiLibPaths.some(i => line.includes(i)));
}

module.exports = isSuitestMethod;
