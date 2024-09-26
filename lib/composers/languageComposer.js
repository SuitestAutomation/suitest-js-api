const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines language method
 */
const languageComposer = makeModifierComposer(composers.LANGUAGE, ['language'], (_, meta, value) => ({
	...meta,
	language: validate(
		validators.LANGUAGE,
		value,
		invalidInputMessage('language', 'Language'),
	),
}));

module.exports = languageComposer;
