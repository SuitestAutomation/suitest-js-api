const {compose} = require('ramda');
const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * @param {Function} toStringMethod
 * @param {Function} toJsonMethod
 * @description Defines toString method.
 */
const makeToStringComposer = (toStringMethod, toJsonMethod) =>
	makeMethodComposer(
		composers.TO_STRING,
		['toString'],
		chain => {
			return compose(
				toStringMethod,
				toJsonMethod,
			)(chain);
		}
	);

module.exports = makeToStringComposer;
