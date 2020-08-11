const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

const matchJSComposer = makeModifierComposer(composers.MATCH_JS, ['matchJS', 'matchesJS'], (_, meta, src) => {
	const res = ['function', 'string'].includes(typeof src) ? src.toString() : null;

	if (res === null) {
		// Unable to parse input
		throw new SuitestError(texts.acceptsFunctionOrString('matchJS'), SuitestError.INVALID_INPUT);
	}

	return {
		...meta,
		comparator: {
			type: SUBJ_COMPARATOR.MATCH_JS,
			val: res,
		},
	};
});

module.exports = matchJSComposer;
