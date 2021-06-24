/**
 * Validation module
 */

const validationKeys = require('../constants/validationKeys');
const validatorsMap = require('./validatorsMap');

module.exports = {
	validate: (key, ...args) => validatorsMap[key](...args),
	validators: validationKeys,
};
