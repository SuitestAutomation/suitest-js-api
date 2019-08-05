/**
 * Validation module
 */

const validationKeys = require('../constants/validationKeys');
const validatorsMap = require('./validatorsMap');

module.exports = {
	validate: (key, value, text) => validatorsMap[key](value, text),
	validators: validationKeys,
};
