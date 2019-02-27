/**
 * 'interactive' test launcher command
 */
const SuitestLauncher = require('../SuitestLauncher');
const {override} = require('../../../config');
const {applyCommonArgs} = require('./common');
const {once} = require('ramda');
const {composeConfig} = require('../composeConfig');

const command = 'interactive';

const describe = 'Run defined test command a single time in interactive session mode on a single device. '
	+ 'It\'s intended for test authoring and application debugging.';

const builder = yargs => {
	applyCommonArgs(yargs);

	yargs
		.option('username', {
			alias: 'u',
			describe: 'E-mail you\'re using to login to Suitest',
			global: false,
		})
		.option('password', {
			alias: 'p',
			describe: 'Password for your Suitest account.',
			global: false,
		})
		.option('org-id', {
			alias: 'o',
			describe: 'Id of the organisation you want to log in into',
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
		.option('inspect', {
			describe: 'Will launch user command with --inspect execArgv, used for debugging',
			global: false,
			type: 'number',
		})
		.option('inspect-brk', {
			describe: 'Will launch user command with --inspect-brk execArgv, used for debugging',
			global: false,
			type: 'number',
		});
};

const handler = async(argv) => {
	const {config, userCommandArgs} = await composeConfig(argv, true);

	override(config);

	const suitestLauncher = new SuitestLauncher(config, userCommandArgs);

	await suitestLauncher.runInteractiveSession();
};

/* istanbul ignore next */
module.exports = {
	command,
	describe,
	builder,
	// Make sure handler is called only once (yargs bug)
	handler: global._suitestTesting ? handler : once(handler),
};
