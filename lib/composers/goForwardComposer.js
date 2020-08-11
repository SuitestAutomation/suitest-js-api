const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines goForward method
 */
const goForwardComposer = makeModifierComposer(composers.GO_FORWARD, ['goForward'], (_, meta) => ({
	...meta,
	isGoForward: true,
}));

module.exports = goForwardComposer;
