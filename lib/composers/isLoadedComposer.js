const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');

const isLoadedComposer = makeModifierComposer(composers.IS_LOADED, ['isLoaded'], meta => ({
	...meta,
	comparator: {type: SUBJ_COMPARATOR.IS_LOADED},
}));

module.exports = isLoadedComposer;
