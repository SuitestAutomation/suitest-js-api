const texts = require('../../texts');
const logLevels = require('../../constants/logLevels');

/**
 * Apply cli args common for interactive and automated commands
 * @param {*} yargs
 */
function applyCommonArgs(yargs) {
	yargs
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
		.option('log-level-test-lines', {
			describe: texts.cliLogLevelTestLines(),
			global: false,
			choices: Object.values(logLevels),
		})
		.option('log-level-test-errors', {
			describe: texts.cliLogLevelTestErrors(),
			global: false,
			choices: Object.values(logLevels),
		})
		.option('log-level-network-logs', {
			describe: texts.cliLogLevelNetworkLogs(),
			global: false,
			choices: Object.values(logLevels),
		})
		.option('log-level-console-logs', {
			describe: texts.cliLogLevelConsoleLogs(),
			global: false,
			choices: Object.values(logLevels),
		})
		.option('log-level-debug', {
			describe: texts.cliLogLevelDebug(),
			global: false,
			type: 'boolean',
		})
		.option('log-level-test-launcher', {
			describe: texts.cliLogLevelTestLauncher(),
			global: false,
			type: Object.values(logLevels),
		})
		.option('timestamp', {
			describe: texts.cliTimestamp(),
			global: false,
			type: 'string',
		});
}

module.exports = {
	applyCommonArgs,
};
