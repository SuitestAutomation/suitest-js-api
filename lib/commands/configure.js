/**
 * Suitest method to override main config.
 */

const {override} = require('../../config');
const chainPromise = require('../utils/chainPromise');
const logger = require('../utils/logger');
const {warnConfigureDeprication} = require('../texts');

/**
 * @param {Object} configObject
 * @returns {Promise<void>}
 */
async function configure(configObject) {
	logger.warn(warnConfigureDeprication());
	// set config override
	override(configObject);
}

module.exports = chainPromise(configure);
