const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines clone method
 */
const cloneComposer = makeModifierComposer(
	composers.CLONE,
	['clone'],
	(_, meta) => ({...meta}),
	{unregisterParent: false}
);

module.exports = cloneComposer;
