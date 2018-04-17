const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {validate, validators} = require('../validataion');
const {invalidInputMessage} = require('../texts');

const containComposer = makeModifierComposer(composers.CONTAIN, ['contain', 'contains'], (meta, val) => ({
	...meta,
	comparator: {
		type: SUBJ_COMPARATOR.CONTAIN,
		val: validate(validators.STRING, val, invalidInputMessage('contain', 'Contain value')),
	},
}));

module.exports = containComposer;
