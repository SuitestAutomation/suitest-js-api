const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validataion');
const {invalidInputMessage} = require('../texts');

/**
 * Defines sendText method
 */
const sendTextComposer = makeModifierComposer(composers.SEND_TEXT, ['sendText'], (meta, value) => ({
	...meta,
	sendText: validate(validators.STRING, value, invalidInputMessage('sendText', 'text')),
}));

module.exports = sendTextComposer;
