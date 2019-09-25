const {makeModifierComposer} = require('../utils/makeComposer');
const {validate, validators} = require('../validation');
const composers = require('../constants/composer');
const {invalidInputMessage} = require('../texts');

/**
 * Defines setSize method
 * @param {Number} width - new width for the browser window, px
 * @param {Number} height - new height for the browser window, px
 */
const setSizeComposer = makeModifierComposer(composers.SET_SIZE, ['setSize'], (meta, width, height) => ({
	...meta,
	isSetSize: true,
	width: validate(validators.POSITIVE_NUMBER, width, invalidInputMessage('setSize', 'Width')),
	height: validate(validators.POSITIVE_NUMBER, height, invalidInputMessage('setSize', 'Height')),
}));

module.exports = setSizeComposer;
