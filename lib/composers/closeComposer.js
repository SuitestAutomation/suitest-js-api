const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defined close method
 */
const closeComposer = makeModifierComposer(composers.CLOSE_APP, ['close'], (_, meta) => ({
	...meta,
	closeApp: true,
}));

module.exports = closeComposer;
