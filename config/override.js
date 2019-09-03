const {extend, overridableFields} = require('./index');
const {validate, validators} = require('../lib/validataion');
const {invalidConfigObj} = require('../lib/texts');
const {pickNonNil} = require('../lib/utils/common');

/**
 * Override config object
 * @param {Object} overrideObj
 */
function override(overrideObj = {}) {
	const _overrideObj = pickNonNil(overridableFields, overrideObj);

	validate(validators.CONFIGURE, _overrideObj, invalidConfigObj());
	extend(_overrideObj);
}

module.exports = {
	override,
};
