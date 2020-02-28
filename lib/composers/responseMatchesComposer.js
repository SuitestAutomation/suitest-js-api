const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../constants/comparator');
const validation = require('../validation');
const makeArgumentsProcessor = require('../utils/makeArgumentsProcessor');
const {invalidInputMessage} = require('../texts');

/**
 * Parse arguments and generate standard structure
 * @param {symbol|string} name
 * @param {number|string} val
 * @param {symbol} [type]
 * @returns {{name: (symbol|string), val: (number|string), compare: symbol}}
 */
function getResponseMatchComposers(name, val, type = PROP_COMPARATOR.EQUAL) {
	return {
		name,
		val,
		compare: type,
	};
}

const processResponseArgs = makeArgumentsProcessor(

	getResponseMatchComposers,
	/**
	 * Map user-provided object to standard structure
	 * @param {symbol|string} name
	 * @param {number|string} val
	 * @param {symbol} [type]
	 * @returns {{name: (symbol|string), val: (number|string), compare: symbol}}
	 */
	({name, val, type = PROP_COMPARATOR.EQUAL}) => getResponseMatchComposers(name, val, type),
	objArg => 'name' in objArg && 'val' in objArg,
	getResponseMatchComposers
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
