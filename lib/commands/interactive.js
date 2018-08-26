/**
 * Start interactive REPL
 */

const path = require('path');
const {startRepl} = require('../testLauncher/repl');
const {config} = require('../../config');
const logger = require('../utils/logger');
const {commandExecuted, commandWillBeExecuted, warnInteractiveRepl} = require('../texts');
const {stackTraceParser} = require('../utils/stackTraceParser');

/**
 * Start interactive REPL
 * @param {Array<string>} [ops.require] array of globs
 * @returns {Promise} response object
 */
async function interactive(ops = {}) {
	if (!config.repl) {
		return logger.warn(warnInteractiveRepl());
	}

	logger.info(commandWillBeExecuted('interactive'));

	const suitest = this;
	// get dir where .interactive() was called
	const callFile = stackTraceParser(new Error())[1].file;
	const callDir = path.dirname(path.normalize(callFile));

	await startRepl({
		context: {suitest},
		dir: callDir,
		// normalize files path relative to ops.dir
		require: ops.require ? ops.require.map(f => path.resolve(callDir, f)) : [],
	});

	logger.info(commandExecuted('interactive'));
}

module.exports = interactive;
