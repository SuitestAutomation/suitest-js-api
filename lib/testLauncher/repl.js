/**
 * Suitest interactive REPL
 */
const colors = require('colors');
const repl = require('repl');
const net = require('net');

const {REPL_START, REPL_STOP, REPL_IPC_PORT} = require('../constants/repl');
let isActive = false;

/**
 * Start REPL
 * @param {Object} ops.context extend repl context
 * @param {Array<string>} ops.require require files relative to ops.file dir
 * @param {string} ops.dir dir co cd repl to, and load files relative to
 * @returns {Promise<void>} resolves when repl exits
 */
function startRepl(ops) {
	let lastCmd; // keep track of last executed command

	const socket = net.connect(REPL_IPC_PORT).unref();

	const replInstance = repl.start({
		prompt: colors.magenta('Suitest $ '),
		terminal: true,
	});

	// execute on start
	replInstance.eval('', replInstance.context, __filename, () => {
		/* istanbul ignore next */
		process.chdir(ops.dir);
	});

	// extend repl scope with ops.context
	Object.assign(replInstance.context, ops.vars);

	upgradeEval(replInstance, (...args) => {
		/* istanbul ignore next */
		lastCmd = args; // remember command
		/* istanbul ignore next */
		ops.require.forEach(reRequire);
	});
	replInstance.defineCommand('r', {
		help: 'repeat last command',
		action() {
			/* istanbul ignore next */
			return lastCmd ? this.eval(...lastCmd) : this.displayPrompt();
		},
	});
	isActive = true;

	socket.on('connect', () => {
		socket.write(REPL_START);
	});

	return new Promise(resolve => {
		replInstance.on('exit', () => {
			socket.end(REPL_STOP);
			isActive = false;
			resolve();
		});
	});
}

/**
 * Upgrade repl eval
 * @modifies replInstance.eval
 */
function upgradeEval(replInstance, upgrader) {
	const _eval = replInstance.eval; // cache default eval

	replInstance.eval = (...args) => {
		upgrader(...args);
		_eval(...args);
	};
}

/**
 * Clear file requuire cache and require it again
 * @param {string} f
 */
function reRequire(f) {
	/* istanbul ignore next */
	delete require.cache[require.resolve(f)]; // clear require cache
	/* istanbul ignore next */
	require(f); // require files specified in ops.require
}

module.exports = {
	startRepl,
	isActive: () => isActive,

	// for testing:
	setActive: val => isActive = val,
	upgradeEval,
};
