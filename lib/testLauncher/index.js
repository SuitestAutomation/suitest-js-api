#!/usr/bin/env node
/* istanbul ignore file */
debugger
require('../utils/sentry/Raven');

const {killChildProcesses} = require('./processReaper');
const {buildYargs, addCommandsAndHelp} = require('./buildArgs');
const {getOwnArgs} = require('./processArgs');
const suitest = require('../../index');

const yargs = buildYargs();
const ownArgs = getOwnArgs();

addCommandsAndHelp(yargs);

yargs.config({}).parse(ownArgs);

const killChildrenAndDie = error => {
	// Gracefully terminate websocket connection, if any
	suitest.webSockets.disconnect();

	// Kill all children  processes
	killChildProcesses();

	if (error instanceof Error) {
		// Dump error to console and exit with error code
		console.error(error);
		process.exit(1);
	} else {
		// Do not update exit code
		process.exit();
	}
};

[
	// When event loop ends or process.exit() called
	'exit',

	// Ctrl+C in terminal
	'SIGINT',
	'SIGQUIT',

	// Ctrl+/ in terminal
	'SIGTERM',

	// Console is closed on Windows
	'SIGHUP',

	// Ctrl+Break on Windows
	'SIGBREAK',

	// Unhandled exception
	'uncaughtException',
	'unhandledRejection',
].forEach(term => process.once(term, killChildrenAndDie));
