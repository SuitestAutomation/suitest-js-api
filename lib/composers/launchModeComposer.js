const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines launchMode method
 */
const launchModeComposer = makeModifierComposer(composers.LAUNCH_MODE, ['launchMode'], (_, meta, value) => ({
	...meta,
	sendText: validate(validators.LAUNCH_MODE, value, invalidInputMessage('launchMode', 'value')),
}));

module.exports = launchModeComposer;
