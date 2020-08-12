const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const HAD_NO_ERROR = require('../constants/hadNoError');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

function hadNoErrorApplyModifier(_, meta, value = HAD_NO_ERROR.CURRENT_URL) {
	return {
		...meta,
		comparator: {type: SUBJ_COMPARATOR.HAD_NO_ERROR},
		searchStrategy: validate(validators.HAD_NO_ERROR, value, invalidInputMessage('hadNoError', 'searchStrategy')),
	};
}

const hadNoErrorComposer = makeModifierComposer(composers.HAD_NO_ERROR, ['hadNoError'], hadNoErrorApplyModifier);

module.exports = hadNoErrorComposer;
