const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');

const visibleComposer = makeModifierComposer(composers.VISIBLE, ['visible'], (_, data) => ({
	...data,
	comparator: {type: SUBJ_COMPARATOR.VISIBLE},
}));

module.exports = visibleComposer;
