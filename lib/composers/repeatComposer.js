const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines repeat methods
 */
const repeatComposer = makeModifierComposer(composers.REPEAT, ['repeat'], (_, meta, value) => ({
	...meta,
	repeat: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, value, invalidInputMessage('repeat', 'Repeat')),
}));

module.exports = repeatComposer;
