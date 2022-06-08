const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines click method
 * @param {'up' | 'down' | 'left' | 'right'} direction
 * @param {number | string} [distance]
 */
const scrollComposer = makeModifierComposer(composers.TAP, ['scroll'], (_, meta, direction, distance) => {
	return {
		...meta,
		isScroll: true,
		direction: validate(validators.DIRECTIONS, direction, invalidInputMessage('scroll', 'direction')),
		distance: distance !== undefined
			? validate(validators.ST_VAR_OR_POSITIVE_NUMBER, distance, invalidInputMessage('scroll', 'distance'))
			: undefined,
	};
});

module.exports = scrollComposer;
