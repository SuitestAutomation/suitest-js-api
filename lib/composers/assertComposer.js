const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defined toAssert method
 */
const assertComposer = makeModifierComposer(composers.ASSERT, ['toAssert'], (_, meta) => ({
	...meta,
	isAssert: true,
}));

module.exports = assertComposer;
