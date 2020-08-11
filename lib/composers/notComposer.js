const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines not and doesNot and isNot methods
 */
const notComposer = makeModifierComposer(composers.NOT, ['not', 'doesNot', 'isNot'], (_, meta) => ({
	...meta,
	isNegated: true,
}));

module.exports = notComposer;
