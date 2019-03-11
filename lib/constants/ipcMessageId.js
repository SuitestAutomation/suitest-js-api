const messageId = Object.freeze({
	SETUP_SESSION: 'SETUP_SESSION', // passed from launcher to child on child connect, contains config object

	REPL_START: 'REPL_START', // sent from child to launcher when interactive() is called,
	REPL_INIT: 'REPL_INIT', // launcher does some manipulations and sends REPL_INIT back
	REPL_STOP: 'REPL_STOP', // send from child to parent when repl is closed
});

module.exports = messageId;
