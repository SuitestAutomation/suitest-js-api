const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {VALUE} = require('../constants/element');
const validation = require('../validataion');
const makeArgumentsProcessor = require('../utils/makeArgumentsProcessor');
const {invalidInputMessage} = require('../texts');

const processMatchRepoArgs = makeArgumentsProcessor(
	/**
	 * Parse arguments and generate standard structure
	 * @param {symbol} name
	 * @param {symbol} [type]
	 * @param {number} [deviation]
	 * @returns {{name: symbol, val: symbol, type: symbol, deviation: number}}
	 */
	(name, type = PROP_COMPARATOR.EQUAL, deviation) => ({
		name,
		val: VALUE.REPO,
		type,
		deviation,
	}),
	/**
	 * Map user-provided object to standard structure.
	 * Val is parsed on purpose to throw if user wants it to be anything else then VALUE.REPO
	 *  to avoid confusion.
	 * @param {symbol} name
	 * @param {symbol} [val]
	 * @param {symbol} [type]
	 * @param {number} [deviation]
	 * @returns {{name: symbol, val: symbol, type: symbol, deviation: number}}
	 */
	({name, val = VALUE.REPO, type = PROP_COMPARATOR.EQUAL, deviation}) => ({
		name,
		val,
		type,
		deviation,
	}),
);

const matchRepoComposer = makeModifierComposer(composers.MATCH_REPO, ['matchRepo', 'matchesRepo'], (data, ...args) => ({
	...data,
	comparator: {
		type: SUBJ_COMPARATOR.MATCH,
		props: validation.validate(
			validation.validators.ELEMENT_REPO_PROPS,
			processMatchRepoArgs(args),
			invalidInputMessage('matchRepo', 'Property')
		),
	},
}));

module.exports = matchRepoComposer;
