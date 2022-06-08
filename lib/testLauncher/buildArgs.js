const yargs = require('yargs/yargs');
const runCommand = require('./commands/run');
const {version} = require('../../package.json');
const {stColors} = require('./launcherLogger');
const texts = require('../texts');

/**
 * Build main argv
 */
const buildYargs = () => {
	const epilogue = texts['tl.seeMoreCommandsOptions'](
		stColors.bold('suitest run --help'),
	);

	return yargs([])
		.usage('$0 [command] [options]')
		.boolean('help')
		.boolean('version')
		.help(false)
		.check((hash, argv) => !argv.length && stColors.errorColor(texts['tl.noArguments']()), false)
		.epilog(epilogue)
		.version(false);
};

/**
 * Add commands, help and version
 * @param {*} yrgs yargs object
 */
const addCommandsAndHelp = yrgs => {
	return yrgs
		.help('help')
		.alias('help', 'h')
		.version(version)
		.alias('version', 'v')
		.command(runCommand);
};

module.exports = {
	buildYargs,
	addCommandsAndHelp,
};
