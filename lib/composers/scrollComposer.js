const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines click method
 */
const scrollComposer = makeModifierComposer(composers.TAP, ['scroll'], (_, meta, direction, distance) => ({
	...meta,
	isScroll: true,
	direction: validate(validators.DIRECTIONS, direction, invalidInputMessage('scroll', 'direction')),
	distance: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, distance, invalidInputMessage('scroll', 'distance')),
}));

module.exports = scrollComposer;
