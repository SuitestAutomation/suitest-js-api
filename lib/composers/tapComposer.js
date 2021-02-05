const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * Defines click method
 */
const tapComposer = makeModifierComposer(composers.TAP, ['tap'], (_, meta, value) => ({
	...meta,
	tap: validate(validators.TAP_TYPE, value, invalidInputMessage('tap', 'First argument')),
}));

module.exports = tapComposer;
