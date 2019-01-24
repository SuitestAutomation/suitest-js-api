const texts = require('../../texts');
const logLevels = require('../../constants/logLevels');

/**
 * Apply cli args common for interactive and automated commands
 * @param {*} yargs
 */
function applyCommonArgs(yargs) {
	yargs
		.option('default-timeout', {
			describe: texts.defaultTimeout(),
			global: false,
			type: 'number',
		})
		.option('continue-on-fatal-error', {
			describe: texts.cliContinueOnFatalError(),
			default: false,
			global: false,
			type: 'boolean',
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
		});
}

module.exports = {
	applyCommonArgs,
};
