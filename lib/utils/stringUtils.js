const {EOL} = require('os');
const ansiRegex = require('ansi-regex');

/**
 * Array to string formated and indented
 * @param {Array<string>} arr
 * @param {boolean} [singleItemToNewLine] if only one item in array place it to new line or not
 * @returns {string}
 */
function arrToString(arr, singleItemToNewLine) {
	if (arr.length === 1 && !singleItemToNewLine) {
		return `${arr[0]}`;
	}

	return arr.reduce((out, i) => `${out}${EOL}\t${i}`, '');
}

/**
 * Stip ansi (coloring) chars from string
 * @param {string} s
 * @returns {string}
 */
function stripAnsiChars(s) {
	return s.replace(ansiRegex(), '');
}

/**
 * Append dot
 * @param {string} s
 * @returns {string}
 */
function appendDot(s) {
	if (s.endsWith('.')) {
		return s;
	}

	return s + '.';
}

/**
 * Returns a shortened function body.
 * @param {Function|string} func
 * @returns {string}
 */
function getShortFunctionBody(func) {
	if (typeof func === 'string')
		return func;

	if (!(func instanceof Function))
		return 'none';

	return func.toString().replace(/[\r\n]/g, '').replace(/\s+/g, ' ').slice(0, 80) + ' ...';
}

/**
 * Get stringified list of object values
 * @param {Object.<*, string>} o - object with string values
 * @returns {string} - eg 'valueA, valueB, valueC'
 */
function valuesToString(o) {
	return Object.values(o).join(', ');
}

/**
 * Replace empty string with [EMPTY] placeholder
 * @param {*} s
 * @returns {*}
 */
function placeholdEmpty(s) {
	return s === '' ? '[EMPTY]' : s;
}

/**
 * Truncate string to 'limit' length. Append ... if over limit.
 */
function truncate(input, limit) {
	if (input.length > limit) {
		return input.substring(0, limit) + '...';
	}

	return input;
}

module.exports = {
	arrToString,
	stripAnsiChars,
	appendDot,
	getShortFunctionBody,
	valuesToString,
	placeholdEmpty,
	truncate,
};
