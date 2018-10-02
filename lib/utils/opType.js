const stripAnsiChars = require('./stringUtils').stripAnsiChars;

// Our chains can be either "A" assert or "E" - evaluation.
// It is very useful for the user to see in the log which type of chain is
// being executed

// In the raw logs the operations will be marked with |A| or |E| in the
// launcher logs they will be coloured.

module.exports = {

	/**
	 * Determines the type of chain. Either assert or evaluation
	 * @param {Object} data
	 * @returns {string}
	 */
	getOpType: function(data) {
		return `|${data && data.isAssert ? 'A' : 'E'}|`;
	},

	/**
	 * Checks if the string contains the opType marker
	 * @param {string} logString
	 * @returns {Boolean|null}
	 */
	isOpType: function(logString) {
		return logString.match(/^\|[AE]|L|AL|AW|AE|AI\|$/);
	},

	/**
	 * Injects the opType marker into the string.
	 * @param logString
	 * @returns {*}
	 */
	formatOpType: function(logString) {
		const str = stripAnsiChars(logString);
		const withOpType = str.match(/\|([AE]|L|AL|AW|AE|AI)\|(.*)/);

		if (!withOpType)
			return {
				opType: '',
				logString,
			};

		return {
			opType: withOpType[1],
			logString: withOpType[2],
		};
	},
};
