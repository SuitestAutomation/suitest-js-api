const read = require('read');
const rc = require('rc');
const {mergeWith, isNil} = require('ramda');
const readline = require('readline');
const validation = require('../validataion');
const launcherLoggerHelper = require('../utils/launcherLoggerHelper');
const {snippets: log, launcherLogger} = require('../testLauncher/launcherLogger');
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
 * Read `.suitestrc` launcher config file.
 * If file not found, return empty object.
 * Supports json and ini formats.
 * cli arguments are not parsed.
 * If file found, but json ivalid, throw error.
 */
function readLauncherConfig() {
	return rc('suitest', {}, () => ({}));
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
 * @param {Function} [callback] callback function
 */
function followChildProcess(child, callback = () => null) {
	readline.createInterface({
		input: child.stdout,
		terminal: false,
	}).on('line', line => {
		callback(line.toString(), '_');
	});
	readline.createInterface({
		input: child.stderr,
		terminal: false,
	}).on('line', line => {
		callback(line.toString(), '_err');
	});
}

/**
 * Validate test launcher's args based on session type
 * @param {String} type session type "AUTOMATED" or "INTERACTIVE"
 * @param {Object} args test launcher arguments
 */
function validateInput(type, args) {
	try {
		validation.validate(
			validation.validators[`TEST_LAUNCHER_${type}`],
			args, `provided for 'suitest ${type.toLowerCase()}' command. It`
		);
	} catch (error) {
		log.argsValidationError(error);

		return process.exit(1);
	}
}

/**
 * If logDir specified creates and return writeStream
 * @param {string} deviceId
 * @param {array} userArgs
 * @param {string} [logDir]
 * @returns {Object}
 */
function writeLogs(deviceId, userArgs, logDir) {
	let writeStream = {};

	try {
		if (logDir) {
			launcherLoggerHelper.mkDirByPathSync(logDir);
			writeStream = launcherLoggerHelper.createWriteStream(logDir, deviceId);
			launcherLogger._(texts['tl.startLogRecording'](logDir, deviceId), deviceId);
		}
		log.startOnDevice(deviceId, userArgs.join(' '));
	} catch (e) {
		if (e.exit) {
			e.exit();
		} else {
			launcherLogger._err(e, deviceId);
			process.exit(1);
		}
	}

	return writeStream;
}

module.exports = {
	handleLauncherError,
	handleChildResult,
	promptPassword,
	readLauncherConfig,
	mergeConfigs,
	followChildProcess: followChildProcess,
	validateInput,
	writeLogs,
};
