/**
 * Suitest interactive REPL
 */

const repl = require('repl');

/**
 * Start REPL
 * @param {Object} suitest instance
 * @returns {Promise<void>}
 */
function startRepl(suitest) {
	let replInstance = repl.start({
		prompt: '> ',
	});

	replInstance.context.suitest = suitest;

	return new Promise(resolve => {
		suitest.resume = () => {
			replInstance.close();
			delete suitest.resume;
			resolve();
		};
	});
}

module.exports = {
	startRepl,
};
