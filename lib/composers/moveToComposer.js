const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines moveTo method
 */
const moveToComposer = makeModifierComposer(
	composers.MOVE_TO,
	['moveTo'],
	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 */
	(_, meta, x, y) => {
		if (x || y) {
			return {
				...meta,
				coordinates: {
					x: validate(
						validators.ST_VAR_OR_POSITIVE_NUMBER,
						x,
						invalidInputMessage('moveTo', 'Position x'),
					),
					y: validate(
						validators.ST_VAR_OR_POSITIVE_NUMBER,
						y,
						invalidInputMessage('moveTo', 'Position y'),
					),
				},
				isMoveTo: true,
			};
		}

		return {
			...meta,
			isMoveTo: true,
		};
	});

module.exports = moveToComposer;
