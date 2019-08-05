const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {unregisterLeaf} = require('../utils/unusedExpressionWatchers');
const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');

/**
 * Until composer populates chain with .until() method,
 * which accepts another chain and stores it under 'until' property
 */
const untilComposer = makeModifierComposer(composers.UNTIL, ['until'], (data, chain) => {
	if (!chain || (typeof chain.toJSON !== 'function')) {
		throw new SuitestError(texts.chainExpected(), SuitestError.INVALID_INPUT);
	}

	unregisterLeaf(chain);

	const json = chain.toJSON();

	// Validate chain
	validate(validators.UNTIL_CONDITION_CHAIN, json);

	return {
		...data,
		until: json.request.condition,
	};
});

module.exports = untilComposer;
