const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines click method
 */
const SINGLE_TAP_TYPE = 'single';
const tapComposer = makeModifierComposer(
	composers.TAP,
	['tap'],
	/**
	 * @param {'single' | 'double' | 'long'} tapType
	 * @param {string | number} tapDuration
	 */
	(_, meta, tapType = SINGLE_TAP_TYPE, tapDuration) => {
		validate(
			validators.TAP_TYPE_AND_DURATION,
			{tapType, tapDuration},
			invalidInputMessage('tap', 'First argument'),
			invalidInputMessage('tap', 'Second argument (duration)'),
		);

		return {
			...meta,
			...(tapDuration ? {tapDuration} : {}),
			tap: tapType,
		};
	},
);

module.exports = tapComposer;
