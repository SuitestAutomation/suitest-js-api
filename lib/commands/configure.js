/**
 * Suitest method to override main config.
 */
const util = require('util');
const {override} = require('../../config/override');
const chainPromise = require('../utils/chainPromise');
const {warnConfigureDeprecation} = require('../texts');

const deprecatedConfigure = util.deprecate(override, warnConfigureDeprecation());

module.exports = chainPromise(deprecatedConfigure);
