const parser = require('yargs-parser');

// Specify which options should be treated as boolen.
// This will enable setting boolean option value to true if not defined explicitly,
// eg: '--disallow-crash-reports' will be parsed as '--disallow-crash-reports=true'
const booleanOpts = ['disallow-crash-reports'];
const inspectOpts = ['inspect', 'inspect-brk'];

const parseOptions = argv => {
	let yargv = parser(argv, {boolean: booleanOpts, number: inspectOpts});

	// if debug option value is not a number parse it as boolean
	if (inspectOpts.find(opt => yargv[opt] !== yargv[opt])) {
		yargv = parser(argv, {boolean: [...booleanOpts, ...inspectOpts]});
	}

	return yargv;
};

/**
 * Get user command and args
 */
const hideOwnArgs = () => {
	let argv = process.argv.slice(2);
	const yargv = parseOptions(argv);

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
	const yargv = parseOptions(argv);

	if (yargv._.length < 2) {
		return argv;
	}

	argv = argv.slice(0, argv.indexOf(yargv._[1]));

	return argv;
};

module.exports = {
	hideOwnArgs,
	getOwnArgs,
	parseOptions, // just for testing purpose
};
