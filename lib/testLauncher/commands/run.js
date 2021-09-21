const path = require('path');
const {once} = require('ramda');
const {composeConfig} = require('../composeConfig');
const texts = require('../../texts');
const logLevels = require('../../constants/logLevels');
const {DEFAULT_SCREENSHOT_DIR} = require('../../constants');
const SuitestLauncher = require('../SuitestLauncher');
const suitest = require('../../../index');

const command = 'run';
const describe = 'Command for start testing';

const builder = yargs => {
	yargs
		.option('token-id', {
			alias: 'k',
			describe: 'Suitest Token Key, can be generated on the profile page',
			global: false,
		})
		.option('token-password', {
			alias: 'p',
			describe: 'Suitest Token Password, can be generated on the profile page',
			global: false,
		})
		.option('device-id', {
			alias: 'd',
			describe: 'Device you want to connect to',
			global: false,
		})
		.option('app-config-id', {
			alias: 'c',
			describe: 'Application configuration id to launch the app with',
			global: false,
		})
		.option('preset', {
			describe: 'Present for configuration and device.',
			array: true,
			global: false,
		})
		.option('inspect', {
			describe: 'Will launch user command with --inspect execArgv, used for debugging',
			global: false,
		})
		.option('inspect-brk', {
			describe: 'Will launch user command with --inspect-brk execArgv, used for debugging',
			global: false,
		})
		.option('config-file', {
			describe: texts.cliConfig(),
			global: false,
			type: 'string',
		})
		.option('default-timeout', {
			describe: texts.defaultTimeout(),
			global: false,
			type: 'number',
		})
		.option('disallow-crash-reports', {
			describe: texts.cliDisallowCrashReports(),
			global: false,
			type: 'boolean',
		})
		.option('log-dir', {
			describe: texts['tl.logDirDescription'](),
			global: false,
		})
		.option('log-level', {
			describe: texts.cliLogLevel(),
			global: false,
			choices: Object.values(logLevels),
		})
		.option('timestamp', {
			describe: texts.cliTimestamp(),
			global: false,
			type: 'string',
		})
		.option('screenshot-dir', {
			describe: 'Directory for saving screenshots.',
			global: false,
			type: 'string',
		})
		.option('concurrency', {
			// TODO: reflect it in docs ?
			// alias: 'c',
			describe: 'How many parallel sessions of the test runner should be spawned. '
				+ 'I.e. on how many devices will it run in parallel. 0 = unlimited',
			default: 0,
			global: false,
		})
		.option('include-changelist', {
			describe: 'If unapplied changes should be tested with runSnippet command.',
			boolean: true,
			default: false,
			global: false,
		});
};

const handler = async(argv) => {
	const {ownArgs, userCommandArgs} = composeConfig(argv);

	suitest.configuration.override(ownArgs);

	const suitestLauncher = new SuitestLauncher(ownArgs, userCommandArgs);

	await suitestLauncher.runTokenSession();
};

/* istanbul ignore next */
module.exports = {
	command,
	describe,
	builder,
	// Make sure async handler is called only once (yargs bug)
	handler: global._suitestTesting ? handler : once(handler),
};
