/**
 * Start interactive REPL
 */

const path = require('path');
const {startRepl, isReplActive} = require('../testLauncher/repl');
const {config} = require('../../config');
const logger = require('../utils/logger');
const {replWarnInteractive, replWelcomeMessage, replSessionEnded} = require('../texts');
const {stackTraceParser} = require('../utils/stackTraceParser');

/**
 * Start interactive REPL
 * @param {Array<string>} [opts.require] array of globs
 * @returns {Promise} response object
 */
async function interactive(opts = {}) {
	if (isReplActive())
		return;

	if (!config.repl)
		return logger.warn(replWarnInteractive());

	// get dir where .interactive() was called
	const callFile = path.normalize(stackTraceParser(new Error())[1].file);
	const cwd = path.dirname(callFile);
	const files = opts.watch;
	const watch = Array.isArray(files)? files : [files? files : cwd];
	const suitest = this;
	const vars = Object.assign({suitest}, opts.vars || {});
	const repeaterName = opts.repeater instanceof Function? opts.repeater.name : 'none';

	logger.special(replWelcomeMessage(
		vars, cwd, watch, repeaterName, logger.colors.suit
	));

	await startRepl({
		cwd,
		vars,
		watch,
		repeater: opts.repeater,
	});

	logger.info(replSessionEnded());
}

module.exports = interactive;
