/**
 * Suitest method to override main config.
 */

const {override} = require('../../config');
const chainPromise = require('../utils/chainPromise');
const logger = require('../utils/logger');
const {warnConfigureDeprecation} = require('../texts');
const {stackTraceWrapper} = require('../utils/stackTraceParser');

/**
 * @param {Object} configObject
 * @returns {Promise<void>}
 */
async function configure(configObject) {
	logger.warn(warnConfigureDeprecation());
	// set config override
	override(configObject);
}

module.exports = chainPromise(stackTraceWrapper(configure));
