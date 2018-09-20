const net = require('net');
const repl = require('repl');
const colors = require('colors');
const chokidar = require('chokidar');

const {REPL_START, REPL_STOP, REPL_IPC_PORT, REPL_INIT} = require('../constants/repl');
const {replFailedToRequire} = require('../texts');

let replActive = false;

/**
 * Establishes communication channel with the main process and
 * starts the REPL
 * @param {Object} opts - repl opts see below
 * @returns {Promise<any>} - resolves when repl session ends
 */
function startRepl(opts) {
	const ipcSocket = net.connect(REPL_IPC_PORT).unref();

	ipcSocket.on('connect', () => {
		ipcSocket.write(REPL_START);
	});

	ipcSocket.on('error', () => {
		// ignore errors silently as main process handles those
	});

	return new Promise((resolve, reject) => {
		ipcSocket.on('data', chunk => {
			const msg = chunk.toString().split('|');
			const [ttyFlag, ttyVal] = msg;

			if (ttyFlag === REPL_INIT)
				return resolve(setupRepl(opts, !!+ttyVal, ipcSocket));

			reject(new Error(`Not implemented for ${msg}`));
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
	const prompt = 'Suitest $ ';
	const replInstance = repl.start({
		prompt: isTty? colors.magenta(prompt) : prompt,
		terminal: isTty,
		ignoreUndefined: true,
	});

	replActive = true;

	Object.assign(replInstance.context, opts.vars);

	const {watch, ignored, repeater, cwd} = opts;

	// execute on start
	replInstance.eval('', replInstance.context, __filename, () => {
		/* istanbul ignore next */
		process.chdir(cwd);
	});

	chokidar.watch(watch, {ignored, cwd}).on('change', path => {
		reRequire(path);

		if (repeater instanceof Function)
			repeater();
	});

	return new Promise(resolve => {
		replInstance.on('exit', () => {
			ipcSocket.end(REPL_STOP);
			replActive = false;
			resolve();
		});
	});
}

/**
 * Clears node require cache for the file and requires this file again
 * @param {string} f - path to the file to re-require
 */
function reRequire(f) {
	try {
		delete require.cache[require.resolve(f)]; // clear require cache
		require(f); // require files specified in ops.require
	} catch (e) {
		console.error(colors.red(replFailedToRequire(f)));
	}
}

module.exports = {
	isReplActive: () => replActive,
	startRepl,
};
