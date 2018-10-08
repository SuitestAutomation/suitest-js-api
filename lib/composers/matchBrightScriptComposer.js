const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

const matchBrightScriptComposer = makeModifierComposer(composers.MATCH_BS, ['matchBrightScript', 'matchesBrightScript'], (meta, src) => {
	const res = ['function', 'string'].includes(typeof src) ? src.toString() : null;

	if (res === null) {
		// Unable to parse input
		throw new SuitestError(texts.acceptsFunctionOrString('matchBrightScript'), SuitestError.INVALID_INPUT);
	}

	return {
		...meta,
		comparator: {
			type: SUBJ_COMPARATOR.MATCH_BS,
			val: res,
		},
	};
});

module.exports = matchBrightScriptComposer;
