const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines toJSON method
 */
const makeToStringComposer = toJSONMethod =>
	makeMethodComposer(composers.TO_JSON, ['toJSON'], (_, data) => toJSONMethod.call(undefined, data));

module.exports = makeToStringComposer;
