/**
 * Suitest method to override main config.
 */

const {override} = require('../../config');
const {validate, validators} = require('../validataion');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage} = require('../texts');

/**
 * @param {Object} configObject
 * @returns {Promise<void>}
 */
async function configure(configObject) {
	// validate configObject json
	validate(validators.CONFIGURE, configObject, invalidInputMessage(configure.name, 'Configuration object'));

	// set config override
	override(configObject);
}

module.exports = chainPromise(configure);
