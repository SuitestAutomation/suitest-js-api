const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validataion');
const {invalidInputMessage} = require('../texts');

/**
 * Defines repeat methods
 */
const repeatComposer = makeModifierComposer(composers.REPEAT, ['repeat'], (meta, value) => ({
	...meta,
	repeat: validate(validators.POSITIVE_NUMBER, value, invalidInputMessage('repeat', 'Repeat')),
}));

module.exports = repeatComposer;
