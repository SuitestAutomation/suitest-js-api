/**
 * Start interactive REPL
 */

const path = require('path');
const repl = require('../testLauncher/repl');
const logger = require('../utils/logger');
const {getShortFunctionBody} = require('../utils/stringUtils');
const texts = require('../texts');
const {stackTraceParser} = require('../utils/stackTraceParser');
const {authContext} = require('../context');

let isReplActive = false;

/**
 * Start interactive REPL
 * @param {Array<string>} [opts.require] array of globs
 * @returns {Promise} response object
 */
async function interactive(opts = {}) {
	if (isReplActive)
		return Promise.resolve();

	const {replWarnInteractive, replWelcomeMessage, replSessionEnded} = texts;

	if (!authContext.isInteractiveSession()) {
		logger.warn(replWarnInteractive());

		return Promise.resolve();
	}

	// get dir where .interactive() was called
	const callFile = path.normalize(stackTraceParser(new Error())[1].file);
	const cwd = path.dirname(callFile);
	const files = opts.watch || path.join(cwd, '**/*.js');
	const watch = Array.isArray(files)? files : [files? files : cwd];
	const suitest = this;
	const vars = Object.assign({suitest}, opts.vars || {});
	const repeater = getShortFunctionBody(opts.repeater);

	logger.special(replWelcomeMessage(
		vars, cwd, watch, repeater, logger.colors.suit
	));

	isReplActive = true;

	await repl.startRepl({
		cwd,
		vars,
		watch,
		repeater: opts.repeater,
	});

	isReplActive = false;
	logger.info(replSessionEnded());
}

module.exports = interactive;
