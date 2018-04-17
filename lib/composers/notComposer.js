const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines not and doesNot methods
 */
const notComposer = makeModifierComposer(composers.NOT, ['not', 'doesNot'], meta => ({
	...meta,
	isNegated: true,
}));

module.exports = notComposer;
