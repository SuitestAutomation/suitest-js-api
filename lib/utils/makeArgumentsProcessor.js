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
 * @param {function(Object, Object): boolean} [fromObjectArgsValidator] - check that passed argument to match composer is valid for fromObject handler
 * @param {function(string, string | number): Object} [fromKeyValue] - returns output result based on key-value sequence
 * @return {Function}
 */
const makeArgumentsProcessor = (
	fromArguments,
	fromObject = identity,
	fromObjectArgsValidator = () => true,
	fromKeyValue = identity,
) => {
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
				return fromObjectArgsValidator(arg)
					? [fromObject(arg)]
					: [
						...Object.getOwnPropertySymbols(arg).map(symbolKey => [symbolKey, arg[symbolKey]]),
						...Object.entries(arg),
					].map(([key, value]) => fromKeyValue(key, value));
			}
		}

		// Case when input a single prop description
		return [fromArguments(...args)];
	};

	return processor;
};

module.exports = makeArgumentsProcessor;
