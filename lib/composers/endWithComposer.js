const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const endWithComposer = makeModifierComposer(composers.END_WITH, ['endWith', 'endsWith'], (meta, val) => ({
	...meta,
	comparator: {
		type: SUBJ_COMPARATOR.END_WITH,
		val: validate(validators.STRING, val, invalidInputMessage('endWith', 'End with value')),
	},
}));

module.exports = endWithComposer;
