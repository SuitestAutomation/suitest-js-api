/**
 * Start interactive REPL
 */

const {startRepl} = require('../testLauncher/repl');
const {config} = require('../../config');
const logger = require('../utils/logger');
const {commandExecuted, commandWillBeExecuted, warnInteractiveRepl} = require('../texts');

/**
 * Start interactive REPL
 * @returns {Promise} response object
 */
async function interactive() {
	logger.info(commandWillBeExecuted('interactive'));

	if (config.repl) {
		await startRepl(this);
	} else {
		logger.warn(warnInteractiveRepl());
	}

	logger.info(commandExecuted('interactive'));
}

module.exports = interactive;
