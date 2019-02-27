/**
 * Suitest test launcher logger
 */
/* istanbul ignore file */

const logger = require('../utils/logger');
const stColors = logger.colors;

/**
 * Log snipepts
 */
function deviceLines(devicesLines, deviceId, deviceName) {
	logger.log('');
	logger.log(`Test started on ${deviceName ? stColors.bold(deviceName) : deviceId}`);
	devicesLines.forEach(log => logger.log(log.msg, deviceId));
	logger.log(`Test finished on ${deviceName ? stColors.bold(deviceName) : deviceId}`);
}

function argsValidationError(error) {
	logger.error(error);
	logger.log('');
	logger.log(
		'Try running `suitest --help` to see usage information or consult our docs at https://suite.st/docs'
	);
	logger.log('');
}

function finalAutomated(failedCount, succeededCount) {
	logger.log('');
	logger.log(
		stColors.mild('Test ')
		+ stColors.errorColor(`failed on ${failedCount} device`)
		+ stColors.mild(' and ')
		+ stColors.successColor(`succeeded on ${succeededCount} devices`));
	logger.log('');
}

function finalInteractive(finishedWithErrors) {
	logger.log('');
	finishedWithErrors
		? logger.error('Test finished with errors')
		: logger.success('Test run completed successfully. Bye!');
	logger.log('');
}

module.exports = {
	stColors,
	snippets: {
		argsValidationError,
		deviceLines,
		finalAutomated,
		finalInteractive,
	},
};
