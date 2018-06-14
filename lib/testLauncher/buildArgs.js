const yargs = require('yargs/yargs');
const automatedCommand = require('./commands/automated');
const interactiveCommand = require('./commands/interactive');
const {version} = require('../../package.json');
const {stColors} = require('./launcherLogger');
const texts = require('../texts');

/**
 * Build main argv
 */
const buildYargs = () => {
	return yargs([])
		.usage('$0 [command] [options]')
		.boolean('help')
		.boolean('version')
		.help(false)
		.check((hash, argv) => !argv.length && stColors.errorColor(texts['tl.noArguments']()), false)
		.epilog(`Run ${stColors.bold('suitest interactive --help')} or ${stColors.bold('suitest automated --help')} to see those command's options`)
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
		.command(automatedCommand)
		.command(interactiveCommand);
};

module.exports = {
	buildYargs,
	addCommandsAndHelp,
};
