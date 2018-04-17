const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');

const existComposer = makeModifierComposer(composers.EXIST, ['exist', 'exists'], meta => ({
	...meta,
	comparator: {type: SUBJ_COMPARATOR.EXIST},
}));

module.exports = existComposer;
