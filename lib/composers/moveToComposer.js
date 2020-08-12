const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines moveTo method
 */
const moveToComposer = makeModifierComposer(composers.MOVE_TO, ['moveTo'], (_, meta) => ({
	...meta,
	isMoveTo: true,
}));

module.exports = moveToComposer;
