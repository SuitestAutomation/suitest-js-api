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
	return s + '.';
}

module.exports = {
	arrToString,
	stripAnsiChars,
	appendDot,
};
