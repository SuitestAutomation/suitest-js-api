const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const startWithComposer = makeModifierComposer(composers.START_WITH, ['startWith', 'startsWith'], (_, meta, val) => ({
	...meta,
	comparator: {
		type: SUBJ_COMPARATOR.START_WITH,
		val: validate(validators.STRING, val, invalidInputMessage('startWith', 'Start with value')),
	},
}));

module.exports = startWithComposer;
