const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');

const hasExitedComposer = makeModifierComposer(composers.HAS_EXITED, ['hasExited'], (_, data) => ({
	...data,
	comparator: {type: SUBJ_COMPARATOR.HAS_EXITED},
}));

module.exports = hasExitedComposer;
