const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines orientation method
 * @param {String} [orientation] - screen orientation
 */
const setOrientationComposer = makeModifierComposer(
	composers.SET_ORIENTATION,
	['setOrientation'],
	(_, meta, orientation) => ({
		...meta,
		orientation: validate(
			validators.SET_ORIENTATION,
			orientation,
			invalidInputMessage('setOrientation', 'orientation'),
		),
	}));

module.exports = setOrientationComposer;
