const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {VALUE} = require('../constants/element');
const validation = require('../validataion');
const makeArgumentsProcessor = require('../utils/makeArgumentsProcessor');
const {invalidInputMessage} = require('../texts');

const processMatchArgs = makeArgumentsProcessor(
	/**
	 * Parse arguments and generate standard structure
	 * @param {symbol} name
	 * @param {symbol|number|string} [val]
	 * @param {symbol} [type]
	 * @param {number} [deviation]
	 * @returns {{name: symbol, val: (symbol|number|string), type: symbol, deviation: number}}
	 */
	(name, val = VALUE.REPO, type = PROP_COMPARATOR.EQUAL, deviation) => ({
		name,
		val,
		type,
		deviation,
	}),
	/**
	 * Map user-provided object to standard structure
	 * @param {symbol} name
	 * @param {symbol|number|string} [val]
	 * @param {symbol} [type]
	 * @param {number} [deviation]
	 * @returns {{name: symbol, val: (symbol|number|string), type: symbol, deviation: number}}
	 */
	({name, val = VALUE.REPO, type = PROP_COMPARATOR.EQUAL, deviation}) => ({
		name,
		val,
		type,
		deviation,
	})
);

const matchComposer = makeModifierComposer(composers.MATCH, ['match', 'matches'], (data, ...args) => ({
	...data,
	comparator: {
		type: SUBJ_COMPARATOR.MATCH,
		props: validation.validate(
			validation.validators.ELEMENT_PROPS,
			{
				data,
				props: processMatchArgs(args),
			},
			invalidInputMessage('match')
		),
	},
}));

module.exports = matchComposer;
