/**
 * During an interactive test execution there are often periods of time
 * where longer waits occur and it is not immediately obvious why it is so.
 * In this case server sends WS events with content type 'progress'.
 * Description is printed to stdout.
 */

const texts = require('../texts');

/**
 * Get humanized interactive progress status explanation text
 * @param {string} status
 * @param {string} [code]
 * @returns {string|undefined} progress status text
 */
function getProgressExplanation(status, code = '') {
	const statusKey = 'interactiveProgress.status.' + status;
	const codeKey = 'interactiveProgress.code.' + code;

	if (status === 'actionFailed' && codeKey in texts) {
		return texts[codeKey]();
	}
	if (statusKey in texts) {
		return texts[statusKey]();
	}
}

/**
 * Print progress description to stdout
 * @param {string} status
 * @param {string} [code]
 */
function handleProgress(status, code) {
	const text = getProgressExplanation(status, code);

	// colors from 'colors' package are not preserved from child process
	// have to define manually
	text && console.log('\x1b[2m', `  - ${text}`, '\x1b[0m');
}

module.exports = {
	getProgressExplanation,
	handleProgress,
};
