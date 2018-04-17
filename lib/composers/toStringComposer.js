const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines abandon method.
 */
const makeToStringComposer = toStringMethod =>
	makeMethodComposer(composers.TO_STRING, ['toString'], chain => toStringMethod.call(undefined, chain));

module.exports = makeToStringComposer;
