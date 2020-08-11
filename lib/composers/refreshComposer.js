const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines refresh method
 */
const refreshComposer = makeModifierComposer(composers.REFRESH, ['refresh'], (_, meta) => ({
	...meta,
	isRefresh: true,
}));

module.exports = refreshComposer;
