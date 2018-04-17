const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validataion');
const {invalidInputMessage} = require('../texts');

/**
 * Defines acceptModal method
 * Accept modal dialog, optionally sending message
 * @param {String} [message] - text to be send to modal dialog
 */
const acceptModalComposer = makeModifierComposer(composers.ACCEPT_MODAL, ['acceptModal'], (meta, message = null) => ({
	...meta,
	isAcceptModal: true,
	acceptModalMessage: validate(
		validators.NON_EMPTY_STRING_OR_NUll,
		message,
		invalidInputMessage('acceptModal', 'Message value'),
	),
}));

module.exports = acceptModalComposer;
