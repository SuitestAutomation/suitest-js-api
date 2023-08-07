const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines interval methods
 */
const intervalComposer = makeModifierComposer(composers.INTERVAL, ['interval'], (_, meta, value) => ({
	...meta,
	interval: validate(validators.ST_VAR_NOT_NEGATIVE_NUMBER, value, invalidInputMessage('interval', 'Interval')),
}));

module.exports = intervalComposer;
