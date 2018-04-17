const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines click method
 */
const clickComposer = makeModifierComposer(composers.CLICK, ['click'], meta => ({
	...meta,
	isClick: true,
}));

module.exports = clickComposer;
