/**
 * 'automated' test launcher command
 */

const SuitestLauncher = require('../SuitestLauncher');
const {hideOwnArgs} = require('../processArgs');
const {readRcConfig, mergeConfigs} = require('../../utils/testLauncherHelper');

const command = 'automated';

const describe = 'Automatically start new test pack run and spawn user '
	+ 'defined test command for each device from the test pack in parallel.';

const builder = yargs => {
	yargs
		.option('token-key', {
			alias: 'k',
			describe: 'Suitest Token Key, can be generated on the profile page',
			global: false,
		})
		.option('token-password', {
			alias: 'p',
			describe: 'Suitest Token Password, can be generated on the profile page',
			global: false,
		})
		.option('test-pack-id', {
			alias: 't',
			describe: 'Id of the test pack to launch',
			global: false,
		})
		// --config-override	configOverride	no	a JSON object with config override. Format for JSON is same as we have on FE
		// --vcs-commit-hash	vcsCommitHash	no	a commit hash in version control system. Will be used on the results page
		// --vcs-branch	vcsBranch	no	a branch name in version control system. Will be used on the results page
		// --app-version	appVersion	no	an application version. Will be used on the results page
		// --metadata	metadata	no	any additional data user might want to include. As plain string. Will be displayed on results page
		.option('concurrency', {
			alias: 'c',
			describe: 'How many parallel sessions of the test runner should be spawned. '
				+ 'I.e. on how many devices will it run in parallel. 0 = unlimited',
			default: 0,
			global: false,
		});
};

const handler = async(argv) => {
	const userCommandArgs = hideOwnArgs();
	const ownArgs = mergeConfigs(readRcConfig(), argv);
	const suitestLauncher = new SuitestLauncher(ownArgs, userCommandArgs);

	await suitestLauncher.runAutomatedSession();
};

module.exports = {
	command,
	describe,
	builder,
	handler,
};
