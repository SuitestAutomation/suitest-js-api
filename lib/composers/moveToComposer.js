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
	 * @param {number} xOffset
	 * @param {number} yOffset
	 */
	(_, meta, xOffset, yOffset) => {
		validate(
			validators.MOVE_TO,
			{xOffset, yOffset},
			invalidInputMessage('moveTo', 'Invalid arguments'),
		);

		return {
			...meta,
			coordinates: {
				x: xOffset,
				y: yOffset,
			},
			isMoveTo: true,
		};
	});

module.exports = moveToComposer;
