const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines setText method
 */
const setTextComposer = makeModifierComposer(composers.SET_TEXT, ['setText'], (meta, value) => ({
	...meta,
	setText: validate(validators.STRING, value, invalidInputMessage('setText', 'text')),
}));

module.exports = setTextComposer;
