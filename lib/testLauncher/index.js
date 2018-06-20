#!/usr/bin/env node

require('../utils/sentry/Raven');
const {extend} = require('../../config');

const {killChildProcesses} = require('./processReaper');
const {buildYargs, addCommandsAndHelp} = require('./buildArgs');
const {getOwnArgs} = require('./processArgs');
const webSockets = require('../api/webSockets');

// Make sure process knows it's a launcher
extend({runningAsLauncher: true});

const yargs = buildYargs();
const ownArgs = getOwnArgs();

addCommandsAndHelp(yargs);

yargs.config({}).parse(ownArgs);

const killChildrenAndDie = error => {
	// Gracefully terminate websocket connection, if any
	webSockets.disconnect();

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
