const colors = require('colors');
const moment = require('moment');
const {config} = require('../../config');
const logLevels = require('../constants/logLevels');
const jsonRenderer = require('prettyjson');
const {formatOpType, isOpType} = require('./opType');

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
	return moment().format('MMM D HH:MM:SS');
}

/**
 * Prefix log with device id
 * @param {object} deviceDetails
 */
function devicePrefix(deviceDetails) {
	if (!deviceDetails)
		return 'Launcher ';

	return deviceDetails.shortDisplayName + ' ';
}

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

let lastLogSource = '';

/**
 *
 * @param consoleMethod
 * @param messages (last argument should be the device
 * @param logMethod
 * @returns {*[]}
 */
function outputLogsInLauncherMode(consoleMethod, messages, logMethod) {
	let deviceDetails = '';
	let logMessages = messages;
	const fontColor = consoleMethod.launcherColor || stColors.suit;
	const last = messages.length - 1;

	// last item in launcher mode can be information about device sending this log
	if (last > 0 && messages[last].deviceId) {
		deviceDetails = messages[last];
		logMessages = messages.slice(0, last);
	}

	const logSource = devicePrefix(deviceDetails);

	// log empty line with the left rail to separate
	// logs of different devices and own launcher logs from one another.
	if (logSource !== lastLogSource) {
		logLine('', logMethod, fontColor, '');
		lastLogSource = logSource;
	}

	// first item could be the operation type (assert or evaluate)
	const {opType, logString} = formatOpType(logMessages[0]);

	let leftRail = stColors.gray(timestamp() + ' ' + logSource);

	if (opType) {
		leftRail += stColors.bold(opType);
		logMessages = logMessages.slice(1);

		if (logString)
			logMessages = [logString, ...logMessages];
	}

	logMessages.forEach(msg => logLine(msg, logMethod, fontColor, leftRail));
}

/**
 * Logger function.
 * Used by both launcher and the child process running the test.
 * @param {*} method
 */
const log = method => (...messages) => {
	// check if logging is allowed by logging level specified in config
	/* istanbul ignore if  */
	if (!method.levels.includes(config.logLevel))
		return;

	const logMethod = console[method.consoleMethod];
	const fontColor = colors[method.color];

	if (config.runningAsLauncher)
		return outputLogsInLauncherMode(method, messages, logMethod);

	let logMessages = messages;

	if (isOpType(messages[0])) {
		// when not running as launcher concat the opType to the same
		// line with the relevant log

		const [lineOpType, line, ...rest] = logMessages;

		logMessages = [lineOpType + ' ' + line, ...rest];
	}

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
