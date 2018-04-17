const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines wasMade method
 */
const willBeMadeComposer = makeModifierComposer(composers.WILL_BE_MADE, ['willBeMade'], data => ({
	...data,
	willBeMade: true,
}));

module.exports = willBeMadeComposer;
