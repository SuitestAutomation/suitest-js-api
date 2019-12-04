const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines abandon method.
 */
const makeToStringComposer = (toStringMethod, toJsonMethod) =>
	makeMethodComposer(
		composers.TO_STRING,
		['toString'],
		// TODO(SUIT-14046) toJsonMethod should be mandatory after refactoring
		chain => toStringMethod.call(undefined, toJsonMethod ? toJsonMethod(chain).request : chain)
	);

module.exports = makeToStringComposer;
