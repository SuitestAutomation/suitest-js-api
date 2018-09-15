/**
 * Suitest interactive REPL
 */

const repl = require('repl');
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

	const replInstance = repl.start({
		prompt: 'Suitest $ ',
	});

	// execute on start
	replInstance.eval('', replInstance.context, __filename, () => {
		/* istanbul ignore next */
		process.chdir(ops.dir); // cd to ops.dir
	});

	// extend repl scope with ops.context
	Object.assign(replInstance.context, ops.context);

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

	return new Promise(resolve => {
		replInstance.on('exit', () => {
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
