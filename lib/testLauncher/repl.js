const net = require('net');
const path = require('path');
const repl = require('repl');
const colors = require('colors');
const chokidar = require('chokidar');

const {getShortFunctionBody} = require('../utils/stringUtils');
const SuitestError = require('../utils/SuitestError');
const {REPL_START, REPL_STOP, REPL_INIT} = require('../constants/repl');
const {
	replFailedToRequire,
	replIpcErrorInChildProcess,
	replIpcNotAvailable,
	replIpcNotImplemented,
	replFilesChanged,
} = require('../texts');

const exceptionListeners = {};
const errorEvents = ['uncaughtException', 'unhandledRejection'];

function pauseErrorListeners() {
	// return;
	errorEvents.forEach(event => {
		if (!exceptionListeners[event])
			exceptionListeners[event] = process.rawListeners(event).map(one => one);

		process.removeAllListeners(event);
		process.on(event, err => console.error(err));
	});
}

function restoreErrorListeners() {
	errorEvents.forEach(event => {
		if (exceptionListeners[event]) {
			process.removeAllListeners(event);
			exceptionListeners[event].forEach(func => process.on(event, func));
		}
	});
}

/**
 * Establishes communication channel with the main process and
 * starts the REPL
 * @param {Object} opts - repl opts see below
 * @returns {Promise<any>} - resolves when repl session ends
 */
function startRepl(opts) {
	if (!process.env.REPL_IPC_PORT) {
		throw new SuitestError(
			replIpcNotAvailable(),
			SuitestError.IPC_ERROR
		);
	}

	const ipcSocket = net.connect(process.env.REPL_IPC_PORT, 'localhost').unref();

	ipcSocket.on('connect', () => {
		ipcSocket.write(REPL_START);
	});

	ipcSocket.on('error', err => {
		throw new SuitestError(
			replIpcErrorInChildProcess(err.message || err.code),
			SuitestError.IPC_ERROR,
			err
		);
	});

	return new Promise(resolve => {
		ipcSocket.on('data', chunk => {
			const msg = chunk.toString().split('|');
			const [ttyFlag, ttyVal] = msg;

			if (ttyFlag === REPL_INIT)
				return resolve(setupRepl(opts, !!+ttyVal, ipcSocket));

			throw new SuitestError(replIpcNotImplemented(msg), SuitestError.IPC_ERROR);
		});
	});
}

/**
 * Starts node REPL console
 * @param {Object} opts - repl options
 * @param {boolean} isTty - tty flag from the receiving stream
 * @param {Socket} ipcSocket - ipc channel to the parent process
 * @returns {Promise<void>} resolves when repl exits
 */
function setupRepl(opts, isTty, ipcSocket) {
	pauseErrorListeners();

	const prompt = 'Suitest $ ';
	const replInstance = repl.start({
		prompt: isTty ? colors.magenta(prompt) : prompt,
		terminal: isTty,
		ignoreUndefined: true,
	});

	Object.assign(replInstance.context, opts.vars);

	const {watch, ignored, repeater, cwd} = opts;

	// execute on start
	replInstance.eval('', replInstance.context, __filename, () => {
		/* istanbul ignore next */
		process.chdir(cwd);
	});

	const chokiOpts = {ignored, cwd};
	const watcher = chokidar.watch(watch, chokiOpts).on('change', async file => {
		const filePath = path.join(cwd, file);

		reRequire(filePath);

		if (repeater instanceof Function) {
			const funcBody = colors.white(getShortFunctionBody(repeater));

			console.log(colors.magenta(
				replFilesChanged(funcBody)
			));

			// Run the repeater without allowing the process to exit with an error
			// Log the error to console instead.

			pauseErrorListeners();
			await repeater();
		}
	});

	return new Promise(resolve => {
		replInstance.on('exit', () => {
			watcher.close();
			restoreErrorListeners();
			ipcSocket.end(REPL_STOP);
			resolve();
		});
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
		console.error(colors.red(replFailedToRequire(f)));
	}
}

module.exports = {
	startRepl,
};
