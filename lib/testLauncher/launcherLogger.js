/**
 * Suitest test launcher logger
 */
/* istanbul ignore file */

const {stColors} = require('../utils/logger');
const {logger} = require('../../index');

function argsValidationError(error) {
	logger.error(error);
	logger.log('');
	logger.log(
		'Try running `suitest --help` to see usage information or consult our docs at https://suite.st/docs',
	);
	logger.log('');
}

function final(failedCount, succeededCount) {
	logger.log('');
	logger.log(
		stColors.mild('Test ')
		+ stColors.errorColor(`failed on ${failedCount} device`)
		+ stColors.mild(' and ')
		+ stColors.successColor(`succeeded on ${succeededCount} devices`));
	logger.log('');
}

module.exports = {
	stColors,
	snippets: {
		argsValidationError,
		final,
	},
};
