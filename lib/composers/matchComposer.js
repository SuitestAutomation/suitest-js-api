const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {VALUE} = require('../constants/element');
const validation = require('../validataion');
const makeArgumentsProcessor = require('../utils/makeArgumentsProcessor');
const {ELEMENT_PROP} = require('../constants/element');
const {invalidInputMessage} = require('../texts');

/**
 * Parse arguments and generate standard structure
 * @param {string} name
 * @param {number|string|symbol} [val]
 * @param {string} [type]
 * @param {number} [deviation]
 * @returns {{name: string, val: (number|string|symbol), type: string, deviation: number}}
 */
function getMatchItem(name, val = VALUE.REPO, type = PROP_COMPARATOR.EQUAL, deviation) {
	return {
		name,
		val,
		type,
		deviation,
	};
}
const processMatchArgs = makeArgumentsProcessor(
	getMatchItem,
	/**
	 * Map user-provided object to standard structure
	 * @param {string} name
	 * @param {number|string|symbol} [val]
	 * @param {string} [type]
	 * @param {number} [deviation]
	 * @returns {{name: string, val: (number|string|symbol), type: string, deviation: number}}
	 */
	({name, val = VALUE.REPO, type = PROP_COMPARATOR.EQUAL, deviation}) => getMatchItem(name, val, type, deviation),
	/**
	 * @description check that passed argument to match composer is valid for fromObject handler
	 * @param {Object} objArg
	 * @returns {boolean}
	 */
	objArg => objArg && Object.values(ELEMENT_PROP).includes(objArg.name),
	/**
	 * @param {string} key
	 * @param {string|number|symbol} value
	 * @returns {{name: string, val: (number|string|symbol), type: string, deviation: number}}
	 */
	getMatchItem,
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
			invalidInputMessage('match'),
		),
	},
}));

module.exports = matchComposer;
