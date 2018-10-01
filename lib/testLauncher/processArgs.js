const parser = require('yargs-parser');

// Specify which options should be treated as boolen.
// This will enable setting boolean option value to true if not defined explicitly,
// eg: '--disallow-crash-reports' will be parsed as '--disallow-crash-reports=true'
const booleanOpts = ['disallow-crash-reports', 'continue-on-fatal-error'];

/**
 * Get user command and args
 */
const hideOwnArgs = () => {
	let argv = process.argv.slice(2);
	const yargv = parser(argv, {boolean: booleanOpts});

	if (yargv._.length < 2) {
		return [];
	}

	argv = argv.slice(argv.indexOf(yargv._[1]));

	return argv;
};

/**
 * Get suitest launcher command and args
 */
const getOwnArgs = () => {
	let argv = process.argv.slice(2);
	const yargv = parser(argv, {boolean: booleanOpts});

	if (yargv._.length < 2) {
		return argv;
	}

	argv = argv.slice(0, argv.indexOf(yargv._[1]));

	return argv;
};

module.exports = {
	hideOwnArgs,
	getOwnArgs,
};
