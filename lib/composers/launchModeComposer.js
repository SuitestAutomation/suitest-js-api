const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines launchMode method
 */
const launchModeComposer = makeModifierComposer(
	composers.LAUNCH_MODE,
	['launchMode'],
	/**
	 * @param {'restart' | 'resume' } value
	 */
	(_, meta, value) => {
		return {
			...meta,
			launchMode: validate(validators.LAUNCH_MODE, value, invalidInputMessage('launchMode', 'wrong argument')),
		};
	},
);

module.exports = launchModeComposer;
