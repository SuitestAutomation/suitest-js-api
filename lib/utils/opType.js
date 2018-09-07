const stripAnsiChars = require('./stringUtils').stripAnsiChars;

// Our chains can be either "A" assert or "E" - evaluation.
// It is very useful for the user to see in the log which type of chain is
// being executed

// In the raw logs the operations will be marked with |A| or |E| in the
// launcher logs they will be coloured.

module.exports = {

	getOpType: function(data) {
		return `|${data && data.isAssert ? 'A' : 'E'}|`;
	},

	isOpType: function(logString) {
		return logString.match(/^\|[AE]\|$/);
	},

	formatOpType: function(logString) {
		const str = stripAnsiChars(logString);
		const withOpType = str.match(/\|([AE])\|(.*)/);

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