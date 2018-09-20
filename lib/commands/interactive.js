/**
 * Start interactive REPL
 */

const path = require('path');
const {startRepl} = require('../testLauncher/repl');
const {config} = require('../../config');
const logger = require('../utils/logger');
const {commandExecuted, warnInteractiveRepl} = require('../texts');
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

	const suitest = this;
	// get dir where .interactive() was called
	const callFile = stackTraceParser(new Error())[1].file;
	const callDir = path.dirname(path.normalize(callFile));

	ops.context = {suitest};

	const explanation = `

Welcome to the interactive mode.
Use the prompt below to execute any JavaScript in real time.

For example try: suitest.openApp() or any other suitest commands. 

Available local variables: ${Object.keys(ops.context).join(', ')}
Current working directory: ${process.cwd()}
Watched files (relative to your working dir): 
	${ops.require}

TIP: Suitest will reload watched files every time you run any prompt command.
So you can edit your JS test in a normal way, re-run the command 
and Suitest will automatically include the changes.
	`;

	logger.special(explanation);

	await startRepl({
		vars: ops.vars,
		ignoreUndefined: true,

		dir: callDir,
		// normalize files path relative to ops.dir
		require: ops.require ? ops.require.map(f => path.resolve(callDir, f)) : [],
	});

	logger.info(commandExecuted('interactive'));
}

module.exports = interactive;
