const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines refresh method
 */
const refreshComposer = makeModifierComposer(composers.REFRESH, ['refresh'], meta => ({
	...meta,
	isRefresh: true,
}));

module.exports = refreshComposer;
