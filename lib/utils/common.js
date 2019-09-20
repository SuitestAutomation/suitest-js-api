const {isNil, pickBy, composeWith} = require('ramda');

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

/**
 * Similar to 'compose'.
 * Accepts array of functions, but stops the composition on any null/undefined response.
 * Eg composeWhileNotNil(bar1, bar2, foo), if foo returns undefined, bar1, bar2 wont be called.
 */
const composeWhileNotNil = composeWith((f, res) => isNil(res) ? res : f(res));

module.exports = {
	pickNonNil,
	composeWhileNotNil,
};
