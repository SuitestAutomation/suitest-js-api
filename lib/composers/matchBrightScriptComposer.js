const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

const matchBrightScriptComposer = makeModifierComposer(
	composers.MATCH_BRS,
	['matchBrightScript', 'matchesBrightScript'],
	(meta, src) => {
		const res = typeof src === 'string' ? src : null;

		if (res === null) {
			// Unable to parse input
			throw new SuitestError(texts.acceptsStringParameter('matchBrightScript'), SuitestError.INVALID_INPUT);
		}

		return {
			...meta,
			comparator: {
				type: SUBJ_COMPARATOR.MATCH_BRS,
				val: res,
			},
		};
	}
);

module.exports = matchBrightScriptComposer;
