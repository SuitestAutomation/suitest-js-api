const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines goBack method
 */
const goBackComposer = makeModifierComposer(composers.GO_BACK, ['goBack'], meta => ({
	...meta,
	isGoBack: true,
}));

module.exports = goBackComposer;
