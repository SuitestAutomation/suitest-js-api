const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');

/**
 * Defines timeout methods
 */
const timeoutComposer = makeModifierComposer(composers.TIMEOUT, ['timeout'], (_, meta, value) => ({
	...meta,
	timeout: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, value, 'timeout'),
}));

module.exports = timeoutComposer;
