const {compose} = require('ramda');
const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {translateLine} = require('../utils/chainUtils');

/**
 * @param {Function} toJsonMethod
 * @description Defines toString method.
 */
const makeToStringComposer = (toJsonMethod) =>
	makeMethodComposer(
		composers.TO_STRING,
		['toString'],
		(classInstance, chain) => {
			return compose(
				(json) => translateLine(json, classInstance.getConfig().logLevel),
				toJsonMethod,
			)(chain);
		},
	);

module.exports = makeToStringComposer;
