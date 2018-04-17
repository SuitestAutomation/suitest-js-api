const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validataion');
const {invalidInputMessage} = require('../texts');

/**
 * Defines not and doesNot methods
 */
const intervalComposer = makeModifierComposer(composers.INTERVAL, ['interval'], (meta, value) => ({
	...meta,
	interval: validate(validators.POSITIVE_NUMBER, value, invalidInputMessage('interval', 'Interval')),
}));

module.exports = intervalComposer;
