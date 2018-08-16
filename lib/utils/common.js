const {isNil, pickBy} = require('ramda');

/**
 * Pick props from object excluding null and undefined
 * @param {Array<string>} keys to pick
 * @param {Object} obj
 * @returns {Object}
 */
function pickNonNil(keys, obj) {
	return pickBy(
		(val, key) => !isNil(val) && keys.includes(key),
		obj,
	);
}

module.exports = {
	pickNonNil,
};
