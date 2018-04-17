const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../constants/comparator');
const validation = require('../validataion');
const makeArgumentsProcessor = require('../utils/makeArgumentsProcessor');
const {invalidInputMessage} = require('../texts');

const processResponseArgs = makeArgumentsProcessor(
	/**
	 * Parse arguments and generate standard structure
	 * @param {symbol|string} name
	 * @param {number|string} [val]
	 * @param {symbol} [type]
	 * @returns {{name: (symbol|string), val: (number|string), compare: symbol}}
	 */
	(name, val, type = PROP_COMPARATOR.EQUAL) => ({
		name,
		val,
		compare: type,
	}),
	/**
	 * Map user-provided object to standard structure
	 * @param {symbol|string} name
	 * @param {number|string} [val]
	 * @param {symbol} [type]
	 * @returns {{name: (symbol|string), val: (number|string), type: symbol}}
	 */
	({name, val, type = PROP_COMPARATOR.EQUAL}) => ({
		name,
		val,
		compare: type,
	})
);

const responseMatchesComposer = makeModifierComposer(
	composers.RESPONSE_MATCHES,
	['responseMatch', 'responseMatches'],
	(data, ...args) => ({
		...data,
		response: {
			type: SUBJ_COMPARATOR.RESPONSE_MATCHES,
			props: validation.validate(
				validation.validators.RESPONSE_MATCHES,
				processResponseArgs(args),
				invalidInputMessage('responseMatch', 'Header')
			),
		},
	})
);

module.exports = responseMatchesComposer;
