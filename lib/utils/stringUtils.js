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
 * Check if provided string is a whole positive number
 * @param {string} str
 * @returns {boolean}
 */
function isWholePositiveNumber(str) {
	return /^\d+$/.test(str);
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

module.exports = {
	arrToString,
	stripAnsiChars,
	appendDot,
	getShortFunctionBody,
	isWholePositiveNumber,
};
