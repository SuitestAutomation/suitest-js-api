const {EOL} = require('os');

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

	return arr.reduce((out, i) => out + `${EOL}\t${i}`, '');
}

module.exports = {
	arrToString,
};
