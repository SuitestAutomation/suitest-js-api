const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../constants/comparator');
const validation = require('../validataion');
const makeArgumentsProcessor = require('../utils/makeArgumentsProcessor');
const {invalidInputMessage} = require('../texts');

const processRequestArgs = makeArgumentsProcessor(
	/**
	 * Parse arguments and generate standard structure
	 * @param {symbol|string} name
	 * @param {number|string|symbol} val
	 * @param {symbol} [type]
	 * @returns {{name: (symbol|string), val: (number|string|symbol), compare: symbol}}
	 */
	(name, val, type = PROP_COMPARATOR.EQUAL) => ({
		name,
		val,
		compare: type,
	}),
	/**
	 * Map user-provided object to standard structure
	 * @param {symbol|string} name
	 * @param {number|string|symbol} val
	 * @param {symbol} [type]
	 * @returns {{name: (symbol|string), val: (number|string|symbol), compare: symbol}}
	 */
	({name, val, type = PROP_COMPARATOR.EQUAL}) => ({
		name,
		val,
		compare: type,
	})
);

const requestMatchesComposer = makeModifierComposer(
	composers.REQUEST_MATCHES,
	['requestMatch', 'requestMatches'],
	(data, ...args) => ({
		...data,
		request: {
			type: SUBJ_COMPARATOR.REQUEST_MATCHES,
			props: validation.validate(
				validation.validators.REQUEST_MATCHES,
				processRequestArgs(args),
				invalidInputMessage('requestMatch', 'Header'),
			),
		},
	})
);

module.exports = requestMatchesComposer;
