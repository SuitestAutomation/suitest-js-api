const colors = require('colors');
const moment = require('moment');
const {config} = require('../../config');
const logLevels = require('../constants/logLevels');
const jsonRenderer = require('prettyjson');
const {formatOpType, isOpType} = require('./opType');
const timestampOff = require('../constants/timestamp').none;

/**
 * Define custom colors
 */
const stColors = {
	gray: colors.gray,
	suit: colors.white,
	mild: colors.cyan,
	bold: colors.cyan.bold,
	errorColor: colors.red,
	successColor: colors.green,
};

const methods = {
	success: {
		key: 'success',
		color: 'green',
		launcherColor: stColors.successColor,
		consoleMethod: 'log',
		levels: [
			logLevels.normal,
			logLevels.verbose,
			logLevels.debug,
		],
	},
	log: {
		key: 'log',
		color: 'white',
		launcherColor: colors.white,
		consoleMethod: 'log',
		levels: [
			logLevels.normal,
			logLevels.verbose,
			logLevels.debug,
		],
	},
	info: {
		key: 'info',
		color: 'gray',
		launcherColor: stColors.gray,
		consoleMethod: 'info',
		prefix: '',
		levels: [
			logLevels.verbose,
			logLevels.debug,
		],
	},
	warn: {
		key: 'warn',
		color: 'yellow',
		launcherColor: colors.yellow,
		consoleMethod: 'warn',
		prefix: 'Warning: ',
		levels: [
			logLevels.normal,
			logLevels.verbose,
			logLevels.debug,
		],
	},
	error: {
		key: 'error',
		color: 'red',
		launcherColor: stColors.errorColor,
		consoleMethod: 'error',
		prefix: 'Error: ',
		levels: [
			logLevels.silent,
			logLevels.normal,
			logLevels.verbose,
			logLevels.debug,
		],
	},
	debug: {
		key: 'debug',
		color: 'cyan',
		launcherColor: colors.blue,
		consoleMethod: 'log',
		prefix: 'Debug: ',
		levels: [
			logLevels.debug,
		],
	},
};

Object.freeze(methods);

function timestamp() {
	const currentTimestamp = config.timestamp;

	if (currentTimestamp === timestampOff)
		return '';

	return moment().format(currentTimestamp);
}

/**
 * Prefix log with device id
 * @param {object} deviceDetails
 */
function devicePrefix(deviceDetails) {
	if (!deviceDetails || !deviceDetails.shortDisplayName)
		return 'Launcher ';

	return deviceDetails.shortDisplayName + ' ';
}

/**
 * Formats and outputs a single log line
 * @param {String|Object} msg - thing to log. If it is an object special rendering is applied.
 * @param {Function} logMethod - console method to apply.
 * @param {Function} fontColor - @see stColor above
 * @param {string} leftRail - informational string at the beginning of the line.
 */
function logLine(msg, logMethod, fontColor, leftRail = '') {
	let obj = msg;

	if (typeof msg === 'string') {
		try {
			obj = JSON.parse(msg);
		} catch (e) {
			// something to make ESLINT happy
		}
	}

	const lines = (typeof obj === 'object') ?
		jsonRenderer.render(obj) : fontColor(String(msg));

	lines.split('\n').forEach(line => {
		logMethod(leftRail + line);
	});

	if (typeof obj === 'object')
		logMethod(leftRail);
}

/**
 * Extracts operation type marker from arguments passed to the logger.
 * @see opType.js
 *
 * @param {Array} messages
 * @returns {{opType: (string|*), logMessages: *}}
 */
function extractOpType(messages) {
	// first item could be the operation type (assert or evaluate)
	let logMessages = messages;
	const {opType, logString} = formatOpType(messages[0]);

	if (opType) {
		logMessages = logMessages.slice(1);
		if (logString)
			logMessages = [logString, ...logMessages];
	}

	return {
		opType,
		logMessages,
	};
}

let lastLogSource = '';

/**
 * @see methods
 * @param {Function} method - logging method to apply.
 * @param {Array} messages - messages to log. When forwarded from child
 * process, the last array item is expected to bear device information.
 */
function outputLogsInLauncherMode(method, messages) {
	const fontColor = method.launcherColor || stColors.suit;
	const deviceDetails = messages[messages.length - 1];
	const consoleMethod = console[method.consoleMethod];
	// eslint-disable-next-line prefer-const
	let {opType, logMessages} = extractOpType(messages);

	// last item in launcher mode can be information about device sending this log
	if (deviceDetails && deviceDetails.deviceId)
		logMessages = logMessages.slice(0, -1);

	const logSource = devicePrefix(deviceDetails);

	// log empty line with the left rail to separate logs of
	// different devices and own launcher logs from one another.
	if (logSource !== lastLogSource) {
		logLine('', consoleMethod, fontColor, '');
		lastLogSource = logSource;
	}

	const timeAndDevice = timestamp() + ' ' + logSource;
	const leftRail = stColors.gray(timeAndDevice) + stColors.bold(opType);

	logMessages.forEach(msg => logLine(msg, consoleMethod, fontColor, leftRail));
}

/**
 * Suitest logger
 * Used by both launcher and the child process running the test.
 * Exposed to the end users as well.
 * @param {*} method
 */
const log = method => (...messages) => {
	// check if logging is allowed by logging level specified in config
	/* istanbul ignore if  */
	if (!method.levels.includes(config.logLevel))
		return;

	if (config.runningAsLauncher)
		return outputLogsInLauncherMode(method, messages);

	let logMessages = messages;

	// when not running as launcher concat the opType to the line with the
	// relevant log
	if (isOpType(messages[0])) {
		const [lineOpType, line, ...rest] = logMessages;

		logMessages = [lineOpType + ' ' + line, ...rest];
	}

	const logMethod = console[method.consoleMethod];
	const fontColor = colors[method.color];

	logMessages.forEach(msg => logLine(msg, logMethod, fontColor));
};

/**
 * Create logger object
 */
const logger = {
	levels: {...logLevels},
	colors: stColors,
	delayed: (message, showAfter) => {
		return setTimeout(() => {
			logger.info(message);
		}, showAfter);
	},
	json: (obj) => {
		console.log(jsonRenderer.render(obj));
	},
};

/**
 * Populate it with native node console methods
 */
Object.values(methods).forEach(method => {
	// create logger console method
	logger[method.key] = log(method);
});

module.exports = logger;
