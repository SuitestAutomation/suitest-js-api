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
		prompt: '> ',
		useGlobal: true,
	});
	const _eval = replInstance.eval; // cache native eval

	// repl on start
	replInstance.eval('', replInstance.context, __filename, () => {
		/* istanbul ignore next */
		process.chdir(ops.dir); // cd to ops.dir
	});

	// extend repl scope with ops.context
	Object.assign(replInstance.context, ops.context);

	// custom eval
	replInstance.eval = (...args) => {
		/* istanbul ignore next */
		lastCmd = args; // remember command
		/* istanbul ignore next */
		ops.require.forEach(f => {
			delete require.cache[require.resolve(f)]; // clear require cache
			require(f); // require files specified in ops.require
		});
		/* istanbul ignore next */
		_eval(...args); // but use native eval
	};

	// custom commands
	replInstance.defineCommand('r', {
		help: 'repeat last command',
		action() {
			/* istanbul ignore next */
			if (lastCmd) {
				this.eval(...lastCmd);
			} else {
				this.displayPrompt();
			}
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

module.exports = {
	startRepl,
	isActive: () => isActive,

	// for testing:
	setActive: val => isActive = val,
};
