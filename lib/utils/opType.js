const stripAnsiChars = require('./stringUtils').stripAnsiChars;

// Our chains can be either "A" assert or "E" - evaluation.
// It is very useful for the user to see in the log which type of chain is
// being executed

// In the raw logs the operations will be marked with |A| or |E| in the
// launcher logs they will be coloured.

const opTypes = Object.freeze({
	assertLine: 'A',
	evalLine: 'E',
	appLog: 'AL',
	appInfo: 'AI',
	appWarn: 'AW',
	appError: 'AE',
});

const baseOpTypeRegexSentence = '[AE]|AL|AW|AE|AI';
// examples: |A|, |E|, |AL|, |AW|, |AE|, |AI|
const opTypeRegex = new RegExp(`^\\|(${baseOpTypeRegexSentence})\\|$`);
// example: |A| some text
const opTypeMatchGroupsRegex = new RegExp(`\\|(${baseOpTypeRegexSentence})\\|(.*)`);

module.exports = {

	/**
	 * Determines the type of chain. Either assert or evaluation
	 * @param {Object} data
	 * @returns {string}
	 */
	getOpType(data) {
		return `|${data && data.isAssert ? opTypes.assertLine : opTypes.evalLine}|`;
	},

	/**
	 * Checks if the string contains the opType marker
	 * @param {string} logString
	 * @returns {Boolean}
	 */
	isOpType: (logString) => opTypeRegex.test(logString),

	/**
	 * Injects the opType marker into the string.
	 * @param logString
	 * @returns {*}
	 */
	formatOpType(logString) {
		const str = stripAnsiChars(logString);
		const withOpType = str.match(opTypeMatchGroupsRegex);

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
	opTypes,
};
