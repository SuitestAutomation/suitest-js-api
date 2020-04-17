const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines wasMade method
 */
const wasMadeComposer = makeModifierComposer(composers.WAS_MADE, ['wasMade'], (_, data) => ({
	...data,
	wasMade: true,
}));

module.exports = wasMadeComposer;
