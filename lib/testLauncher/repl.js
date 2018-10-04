const net = require('net');
const path = require('path');
const repl = require('repl');
const colors = require('colors');
const chokidar = require('chokidar');

const {getShortFunctionBody} = require('../utils/stringUtils');
const SuitestError = require('../utils/SuitestError');
const {REPL_START, REPL_STOP, REPL_INIT} = require('../constants/repl');
const texts = require('../texts');
const errorListeners = require('../utils/errorListeners');

let currentErrorListeners = {};

/**
 * Establishes communication channel with the main process and
 * starts the REPL
 * @param {Object} opts - repl opts see below
 * @returns {Promise<any>} - resolves when repl session ends
 */
function startRepl(opts) {
	const replPort = getReplPort();
	const ipcSocket = net.connect(replPort, 'localhost').unref();

	ipcSocket.on('connect', () => ipcSocket.write(REPL_START));
	ipcSocket.on('error', err => replSocketError(err));

	return new Promise(resolve => {
		ipcSocket.on(
			'data',
			chunk => onReplSocketMessage(chunk, ipcSocket, opts, resolve)
		);
	});
}

/**
 * Returns the repl IPC port
 * @returns {Number}
 */
function getReplPort() {
	const port = process.env.REPL_IPC_PORT;

	if (!port) {
		throw new SuitestError(
			texts.replIpcNotAvailable(),
			SuitestError.IPC_ERROR
		);
	}

	return port;
}

/**
 * Reacts on the IPC socket initialization errors.
 * @param err
 */
function replSocketError(err) {
	throw new SuitestError(
		texts.replIpcErrorInChildProcess(err.message || err.code),
		SuitestError.IPC_ERROR,
		err
	);
}

/**
 * Reacts on positive IPC socket communication
 * @param {Buffer} chunk
 * @param {net.Socket} ipcSocket
 * @param {Object} replOptions
 * @param {Function} onReady
 * @returns {*}
 */
function onReplSocketMessage(chunk, ipcSocket, replOptions, onReady) {
	const {replIpcNotImplemented} = texts;
	const msg = chunk.toString().split('|');
	const [ttyFlag, ttyVal] = msg;

	if (ttyFlag === REPL_INIT)
		return onReady(setupRepl(replOptions, !!+ttyVal, ipcSocket));

	throw new SuitestError(replIpcNotImplemented(msg), SuitestError.IPC_ERROR);
}

/**
 * Starts node REPL console
 * @param {Object} opts - repl options
 * @param {boolean} isTty - tty flag from the receiving stream
 * @param {net.Socket} ipcSocket - ipc channel to the parent process
 * @returns {Promise<void>} resolves when repl exits
 */
function setupRepl(opts, isTty, ipcSocket) {
	currentErrorListeners = errorListeners.pauseErrorListeners();

	const {watch, ignored, repeater, cwd, vars} = opts;

	const watcher = chokidar.watch(watch, {ignored, cwd}).on(
		'change',
		file => onFileChange(file, cwd, repeater)
	);

	const prompt = 'Suitest $ ';
	const replInstance = repl.start({
		prompt: isTty ? colors.magenta(prompt) : prompt,
		terminal: isTty,
		ignoreUndefined: true,
	});

	Object.assign(replInstance.context, vars);

	setReplCwd(replInstance, cwd);

	return new Promise(resolve => {
		replInstance.on('exit', () => {
			watcher.close();
			errorListeners.restoreErrorListeners(currentErrorListeners);
			!ipcSocket.destroyed && ipcSocket.end(REPL_STOP);
			resolve();
		});
	});
}

/**
 * Run actions when file system change occurs during in REPL mode
 * @param file
 * @param cwd
 * @param repeater
 * @returns {Promise<void>}
 */
async function onFileChange(file, cwd, repeater) {
	const filePath = path.join(cwd, file);

	reRequire(filePath);

	if (!(repeater instanceof Function))
		return;

	const funcBody = colors.white(getShortFunctionBody(repeater));

	console.log(colors.magenta(
		texts.replFilesChanged(funcBody)
	));

	// Run the repeater without allowing the process to exit with an error
	// Log the error to console instead.

	currentErrorListeners = errorListeners.pauseErrorListeners();
	await repeater();
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
};
