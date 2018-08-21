/**
 * Suitest interactive REPL
 */

const repl = require('repl');

let isActive = false;

/**
 * Start REPL
 * @param {Object} suitest instance
 * @returns {Promise<void>}
 */
function startRepl(suitest) {
	let replInstance = repl.start({
		prompt: '> ',
	});

	isActive = true;
	replInstance.context.suitest = suitest;

	return new Promise(resolve => {
		suitest.resume = () => {
			replInstance.close();
			isActive = false;
			delete suitest.resume;
			resolve();
		};
	});
}

module.exports = {
	startRepl,
	isActive: () => isActive,

	// for testing:
	setActive: val => isActive = val,
};
