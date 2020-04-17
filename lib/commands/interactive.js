/**
 * Start interactive REPL
 */

const path = require('path');
const semver = require('semver');
const repl = require('../testLauncher/repl');
const {getShortFunctionBody} = require('../utils/stringUtils');
const texts = require('../texts');
const {stackTraceParser} = require('../utils/stackTraceParser');
const {authContext, logger} = require('../../index');

let isReplActive = false;

/**
 * Prepares parameters for the REPL session
 * @param {String=} opts.cwd
 * @param {Array|String=} opts.watch
 * @param {Array|String=} opts.ignored
 * @param {Object=} opts.vars
 * @param {Function=} opts.repeater
 * @returns {*[]}
 */
function getReplParameters(opts, suitest) {
	// get dir where .interactive() was called
	const callFile = path.normalize(stackTraceParser(new Error())[2].file);
	const cwd = opts.cwd || path.dirname(callFile);
	const file = path.basename(callFile);
	const files = opts.watch || path.join(cwd, '**/*.js');
	const watch = Array.isArray(files)? files : [files? files : cwd];
	const vars = Object.assign({suitest}, opts.vars);

	return [vars, cwd, watch, file];
}

/**
 * Start interactive REPL
 * @param {String=} opts.cwd
 * @param {Array|String=} opts.watch
 * @param {Array|String=} opts.ignored
 * @param {Object=} opts.vars
 * @param {Function=} opts.repeater
 * @returns {Promise} response object
 */
async function interactive(opts = {}) {
	if (semver.lt(process.version, '9.4.0')) {
		logger.error(texts.replWrongNodeVersion(process.version));
		process.exit(1);
	}

	if (isReplActive)
		return Promise.resolve();

	const {replWarnInteractive, replWelcomeMessage, replSessionEnded} = texts;

	if (!authContext.isInteractiveSession()) {
		logger.warn(replWarnInteractive());

		return Promise.resolve();
	}

	const [vars, cwd, watch, callFile] = getReplParameters(opts, this);
	const repeater = getShortFunctionBody(opts.repeater);

	logger.special(replWelcomeMessage(
		vars, cwd, watch, repeater, logger.colors.suit
	));

	isReplActive = true;

	await repl.startRepl({
		cwd,
		vars,
		watch,
		callFile,
		ignored: opts.ignored,
		repeater: opts.repeater,
	});

	isReplActive = false;
	logger.info(replSessionEnded());
}

module.exports = interactive;
