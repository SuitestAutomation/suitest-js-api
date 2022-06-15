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
		const coordinates = {};

		if (x !== undefined) {
			coordinates.x = validate(
				validators.ANY_NUMBER,
				x,
				invalidInputMessage('moveTo', 'Position x'),
			);
		}

		if (y !== undefined) {
			coordinates.y = validate(
				validators.ANY_NUMBER,
				y,
				invalidInputMessage('moveTo', 'Position x'),
			);
		}

		if ('x' in coordinates || 'y' in coordinates) {
			return {
				...meta,
				coordinates,
				isMoveTo: true,
			};
		}

		return {
			...meta,
			isMoveTo: true,
		};
	});

module.exports = moveToComposer;
