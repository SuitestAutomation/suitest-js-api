const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const equalComposer = makeModifierComposer(composers.EQUAL, ['equal', 'equals'], (meta, val) => ({
	...meta,
	comparator: {
		type: SUBJ_COMPARATOR.EQUAL,
		val: validate(validators.STRING, val, invalidInputMessage('equal', 'Equal value')),
	},
}));

module.exports = equalComposer;
