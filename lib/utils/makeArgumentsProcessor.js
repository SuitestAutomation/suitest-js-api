const {
	is,
	flatten,
	identity,
} = require('ramda');
const SuitestError = require('../utils/SuitestError');
const texts = require('../texts');

/**
 * Process different ways of defining arguments and output unified format
 * Supports an array of definitions, single definition as object or single definition
 *  as arguments spread
 * @param {Function} fromArguments - parse argument spread and generate object
 * @param {Function} [fromObject] - parse user-defined object and generate object with correct structure
 * @return {Function}
 */
const makeArgumentsProcessor = (fromArguments, fromObject = identity) => {
	/**
	 * @param {Array} args - arguments, passed by user
	 * @param {Set} [antiRecursion] - collection of nested arrays to prevent recursive structures
	 * @return {Array} - output array
	 */
	const processor = (args, antiRecursion = new Set) => {
		if (args.length === 1) {
			const arg = args[0];

			// Case when input is an array, check items recursively
			if (Array.isArray(arg)) {
				if (antiRecursion.has(arg)) {
					throw new SuitestError(texts.recursionDetected, SuitestError.INVALID_INPUT);
				} else {
					antiRecursion.add(arg);
				}

				return flatten(arg.map(arg => processor([arg], antiRecursion)));
			}

			// If it's an object, validate it
			if (arg !== null && is(Object, arg) && !is(Symbol, arg)) {
				return [fromObject(arg)];
			}
		}

		// Case when input a single prop description
		return [fromArguments(...args)];
	};

	return processor;
};

module.exports = makeArgumentsProcessor;
