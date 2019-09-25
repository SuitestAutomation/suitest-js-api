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
 * @param {string} [type]
 * @returns {{name: (symbol|string), val: (number|string), compare: string}}
 */
function getRequestMatchItem(name, val, type = PROP_COMPARATOR.EQUAL) {
	return {
		name,
		val,
		compare: type,
	};
}

const processRequestArgs = makeArgumentsProcessor(
	getRequestMatchItem,
	/**
	 * Map user-provided object to standard structure
	 * @param {symbol|string} name
	 * @param {number|string} val
	 * @param {string} [type]
	 * @returns {{name: (symbol|string), val: (number|string), compare: string}}
	 */
	({name, val, type = PROP_COMPARATOR.EQUAL}) => getRequestMatchItem(name, val, type),
	objArg => 'name' in objArg && 'val' in objArg,
	getRequestMatchItem
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
