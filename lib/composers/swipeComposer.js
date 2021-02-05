const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines click method
 */
const swipeComposer = makeModifierComposer(composers.TAP, ['swipe', 'flick'], (_, meta, direction, distance, duration) => ({
	...meta,
	isSwipe: true,
	direction: validate(validators.DIRECTIONS, direction, invalidInputMessage('swipe/flick', 'direction')),
	distance: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, distance, invalidInputMessage('swipe/flick', 'distance')),
	duration: validate(validators.ST_VAR_OR_POSITIVE_NUMBER, duration, invalidInputMessage('swipe/flick', 'duration')),
}));

module.exports = swipeComposer;
