const read = require('read');
const {mergeWith, isNil} = require('ramda');
const readline = require('readline');
const validation = require('../validataion');
const launcherLoggerHelper = require('../utils/launcherLoggerHelper');
const {stColors} = require('../testLauncher/launcherLogger');
const {snippets: log} = require('../testLauncher/launcherLogger');
const logger = require('../utils/logger');
const texts = require('../texts');
const path = require('path');

/**
 * Handle test launcher command error
 * @param {Error} error
 */
function handleLauncherError(error) {
	if (error.exit) {
		error.exit(1);
	} else {
		logger.error(error);
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
 * Merge configs. If value is not null or undefined in configB - take it
 *  otherwise, take value from configA
 *
 * @param {Object} configA - base config
 * @param {Object} configB - config to extend with
 * @returns {Object}
 */
function mergeConfigs(configA, configB) {
	return mergeWith(
		(a, b) => isNil(b) ? a : b,
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
		callback(line.toString(), 'log');
	});
	readline.createInterface({
		input: child.stderr,
		terminal: false,
	}).on('line', line => {
		callback(line.toString(), 'error');
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
 * @param {string} [deviceName]
 * @returns {Object}
 */
function writeLogs(deviceId, userArgs, logDir, deviceName) {
	let writeStream = {};

	try {
		if (logDir) {
			launcherLoggerHelper.mkDirByPathSync(logDir);
			writeStream = launcherLoggerHelper.createWriteStream(logDir, deviceId, deviceName);
			deviceName && writeStream.write(deviceName);
			logger.log(
				texts['tl.startLogRecording'](deviceName ? stColors.bold(deviceName): deviceId),
				deviceId);
			logger.log(`${path.resolve(logDir)}${path.sep}${deviceId}.log`, deviceId);
			writeStream = launcherLoggerHelper.createWriteStream(logDir, deviceId);
			logger.log(texts['tl.startLogRecording'](deviceId), deviceId);
			logger.log(`${path.resolve(logDir)}${path.sep}${deviceId}.log`, deviceId);
		}
		log.startOnDevice(deviceId, userArgs.join(' '), deviceName);
	} catch (e) {
		if (e.exit) {
			e.exit();
		} else {
			logger.error(e, deviceId, deviceName);
			process.exit(1);
		}
	}

	return writeStream;
}

module.exports = {
	handleLauncherError,
	handleChildResult,
	promptPassword,
	mergeConfigs,
	followChildProcess: followChildProcess,
	validateInput,
	writeLogs,
};
