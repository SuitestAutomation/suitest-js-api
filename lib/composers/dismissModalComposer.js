const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines modal dialog method
 */
const dismissModalComposer = makeModifierComposer(composers.DISMISS_MODAL, ['dismissModal'], (_, meta) => ({
	...meta,
	isDismissModal: true,
}));

module.exports = dismissModalComposer;
