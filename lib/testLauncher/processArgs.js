const parser = require('yargs-parser');

/**
 * Get user command and args
 */
const hideOwnArgs = () => {
	let argv = process.argv.slice(2);
	const yargv = parser(argv);

	if (yargv._.length < 2) {
		return [];
	}

	argv = argv.slice(argv.indexOf(yargv._[1]));

	// make process arg work with commands as path
	if (argv[0][0] === '.') {
		argv.unshift(process.execPath);
	}

	return argv;
};

/**
 * Get suitest launcher command and args
 */
const getOwnArgs = () => {
	let argv = process.argv.slice(2);
	const yargv = parser(argv);

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
