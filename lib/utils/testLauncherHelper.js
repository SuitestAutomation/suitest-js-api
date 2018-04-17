const read = require('read');
const cosmiconfig = require('cosmiconfig');
const {mergeWith, isNil} = require('ramda');
const readline = require('readline');

const {launcherLogger} = require('../testLauncher/launcherLogger');
const texts = require('../texts');

/**
 * Handle test launcher command error
 * @param {Error} error
 */
function handleLauncherError(error) {
	if (error.exit) {
		error.exit(1);
	} else {
		launcherLogger._err(error);
		process.exit(1);
	}
}

/**
 * Handle test launcher child process result
 * @param {boolean} finishedWithErrors
 */
function handleChildResult(finishedWithErrors) {
	if (finishedWithErrors) {
		process.exit(1);
	} else {
		process.exit(0);
	}
}

/**
 * Prompt user password.
 * If nothing provided, ask again.
 */
function promptPassword() {
	return new Promise((resolve) => read({
		prompt: texts['tl.promptPassword'](),
		silent: true,
		replace: '*',
	}, (err, pass) => {
		/* istanbul ignore if */
		if (err) {
			// process was exited, go to new line
			process.stdin.write('\n');
		} else if (!pass) {
			resolve(promptPassword());
		} else {
			resolve(pass);
		}
	}));
}

/**
 * Read `.suitestrc` or `.suitestrc.js` launcher config file.
 * If file not found, return empty object.
 * If file found, but json ivalid, throw error.
 */
function readLauncherConfig() {
	// result.config is the parsed configuration object
	// result.filepath is the path to the config file that was found
	const result = cosmiconfig('suitest', {
		rc: '.suitestrc',
		js: 'suitestrc.js',
		packageProp: false,
		rcExtensions: true,
		rcStrictJson: true,
		sync: true,
	}).load();

	return result ? result.config : {};
}

/**
 * Merge configs. Overwrite null and undefined properties of objectA with objectB.
 * @param {Object} configA
 * @param {Object} configB
 * @returns {Object}
 */
function mergeConfigs(configA, configB) {
	return mergeWith(
		(a, b) => isNil(a) ? b : a,
		configA,
		configB,
	);
}

/**
 * Read child process stdout and stderr, apply callback function on each line
 * @param {Object} child node child process
 * @param {Function} callback callback function
 */
function followChildProccess(child, callback) {
	readline.createInterface({
		input: child.stdout,
		terminal: false,
	}).on('line', line => {
		callback && callback(line.toString());
	});
	readline.createInterface({
		input: child.stderr,
		terminal: false,
	}).on('line', line => {
		callback && callback(line.toString());
	});
}

module.exports = {
	handleLauncherError,
	handleChildResult,
	promptPassword,
	readLauncherConfig,
	mergeConfigs,
	followChildProccess,
};
