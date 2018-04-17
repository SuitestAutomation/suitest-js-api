/**
 * Check whether function is method of suitest api by its stack line
 * @param {string} methodName
 * @returns boolean
 */

const {API_CONSTRUCTOR_NAME, API_LIB_PATH} = require('../../lib/constants');
const path = require('path');

function isSuitestMethod(line) {
	const apiLibPath = path.normalize(API_LIB_PATH);

	return line && (line.includes(API_CONSTRUCTOR_NAME) || line.includes(apiLibPath));
}

module.exports = isSuitestMethod;
