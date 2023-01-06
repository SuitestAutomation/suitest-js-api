const path = require('path');
const repl = require('repl');
const ramda = require('ramda');
const colors = require('colors');
const chokidar = require('chokidar');

const texts = require('../texts');
const ipcClient = require('./ipc/client');
const envVars = require('../constants/environment');
const messageId = require('../constants/ipcMessageId');
const errorListeners = require('../utils/errorListeners');
const {getShortFunctionBody} = require('../utils/stringUtils');

let currentErrorListeners = {};

/**
 * Establishes communication channel with the main process and
 * starts the REPL
 * @param {Object} opts - repl opts see below
 * @returns {Promise<void>} - resolves when repl session ends
 */
const startRepl = opts => {
	// if running as launcher child, send REPL_START to launcher and wait for REPL_INIT message
	if (process.env[envVars.SUITEST_CHILD_PROCESS]) {
		ipcClient.write(messageId.REPL_START);

		return new Promise(resolve => {
			ipcClient.addListener(messageId.REPL_INIT, ({isTTY}) => {
				resolve(setupRepl(opts, isTTY));
			});
		});
	}

	// else, just start repl
	return setupRepl(opts, process.stdout.isTTY);
};

/**
 * Signal launcher that repl has stopped
 * @param {Object} ipcClient - ipcClient module
 */
const stopRepl = () => {
	// if running as launcher child, send REPL_STOP to launcher
	if (process.env[envVars.SUITEST_CHILD_PROCESS]) {
		ipcClient.write(messageId.REPL_STOP);
	}
};

/**
 * Starts node REPL console
 * @param {Object} opts - repl options
 * @param {boolean} isTTY - tty flag from the receiving stream
 * @returns {Promise<void>} resolves when repl exits
 */
function setupRepl(opts, isTTY) {
	currentErrorListeners = errorListeners.pauseErrorListeners();

	const {watch, ignored, repeater, cwd, vars, callFile} = opts;

	const watcher = chokidar.watch(watch, {ignored, cwd}).on(
		'change',
		file => setTimeout(() => onFileChange(file, cwd, callFile, repeater), 50),
	);

	const prompt = 'Suitest $ ';
	const replInstance = repl.start({
		prompt: isTTY ? colors.magenta(prompt) : prompt,
		terminal: isTTY,
		ignoreUndefined: true,
	});

	Object.assign(replInstance.context, vars);

	setReplCwd(replInstance, cwd);

	return new Promise(resolve => {
		replInstance.on('exit', () => {
			watcher.close();
			errorListeners.restoreErrorListeners(currentErrorListeners);
			stopRepl();
			resolve();
		});
	});
}

/**
 * Resolves repeater function from a string.
 * Expected string format is: any.path.to.func or module#any.path.to.func
 * Module resolution is relative to cwd.
 * @param {String} repeater - string representation of repeater
 * @param {String} cwd - current working directory
 * @param {string} callFilename - name of the file where "startREPL" was called.
 * @returns {*}
 */
function repeaterFromString(repeater, cwd, callFilename) {
	const {replFailedToFindRepeater} = texts;

	if (typeof repeater !== 'string')
		return;

	try {
		if (!repeater.includes('#'))
			repeater = callFilename + '#' + repeater;

		const [module, obj] = repeater.split('#');
		const exports = require(path.join(cwd, module));

		return exports[obj] || ramda.path(obj.split('.'), exports);
	} catch (e) {
		console.log(colors.red(replFailedToFindRepeater(repeater), e));
	}
}

/**
 * Run actions when file system change occurs during in REPL mode
 * @param file
 * @param cwd
 * @param repeater
 * @param callFile
 * @returns {Promise<void>}
 */
async function onFileChange(file, cwd, callFile, repeater) {
	const {replFilesChanged, replRepeaterNotAFunc} = texts;
	const filePath = path.join(cwd, file);

	reRequire(filePath);

	const func = repeaterFromString(repeater, cwd, callFile) || repeater;

	if (!(func instanceof Function)) {
		if (repeater)
			console.error(colors.red(replRepeaterNotAFunc(repeater, func)));

		return;
	}

	const funcBody = colors.white(getShortFunctionBody(func));

	console.log(colors.magenta(
		replFilesChanged(funcBody),
	));

	// Run the repeater without allowing the process to exit with an error
	// Log the error to console instead.

	currentErrorListeners = errorListeners.pauseErrorListeners();
	await func();
}

/**
 * Sets the current working directory of the repl shell
 * @param {REPLServer} replInstance
 * @param {String} cwd - the directory to set
 */
function setReplCwd(replInstance, cwd) {
	replInstance.eval('', replInstance.context, __filename, () => {
		process.chdir(cwd);
	});
}

/**
 * Clears node require cache for the file and requires this file again
 * @param {string} f - path to the file to re-require
 */
function reRequire(f) {
	let file;

	try {
		file = require.resolve(f);
	} catch (e) {
		// file has not been found so it was either not required before
		// or deleted just now -> ignore this.
		return;
	}

	// Require will always throw if the file was not found
	// so it is safe to continue.

	// Now refresh the cache of the previously required files.

	try {
		const cache = require.cache[file];

		if (cache) {
			delete require.cache[file];
			require(f);
		}
	} catch (e) {
		console.error(colors.red(texts.replFailedToRequire(f)));
	}
}

module.exports = {
	startRepl,
	repeaterFromString,
	stopRepl,
	setupRepl,
};
