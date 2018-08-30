const colors = require('colors');
const {stackTraceParser} = require('./stackTraceParser');
const {EOL} = require('os');
const moment = require('moment');
const {config} = require('../../config');
const logLevels = require('../constants/logLevels');
const getDeviceName = require('./getDeviceInfo').getDeviceName;
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

function logLine(msg, logMethod, fontColor, leftRail) {
	let obj = msg;

	if (typeof msg === 'string') {
		try {
			obj = JSON.parse(msg);
		} catch (e) {
			// something to make ESLINT happy
		}
	}

	const lines = (typeof obj === "object") ?
		jsonRenderer.render(obj) : fontColor(String(msg));

	lines.split('\n').forEach(line => {
		logMethod(leftRail + line);
	});

	if (typeof obj === 'object')
		logMethod(leftRail);
}

let lastLogSource = '';

/**
 * Logger function.
 * @param {*} method
 */
const log = method => (...messages) => {
	// check if logging is allowed by logging level specified in config
	/* istanbul ignore if  */
	if (!method.levels.includes(config.logLevel))
		return;

	const logMethod = console[method.consoleMethod];
	let fontColor = colors[method.color];
	let logMessages = messages;
	let leftRail = '';

	// when running as launcher the last argument passed to this function
	// is device information. Rest are things to log.
	if (config.runningAsLauncher) {
		let deviceDetails = '';

		if (messages.length > 1 && messages[messages.length - 1].deviceId) {
			deviceDetails = messages[messages.length - 1];
			logMessages = messages.slice(0, messages.length - 1);
		}

		const logSource = devicePrefix(deviceDetails);

		// log empty line with the left rail to separate
		// logs of different devices from one another.
		if (logSource !== lastLogSource) {
			logLine('', logMethod, fontColor, '');
			lastLogSource = logSource;
		}

		const {opType, logString} = formatOpType(logMessages[0]);

		leftRail = stColors.gray(timestamp() + ' ' + logSource);

		if (opType) {
			leftRail += `${stColors.bold(opType)} `;
			logMessages = [logString, ...logMessages.slice(1)];
		}

		fontColor = method.launcherColor || stColors.suit;
	} else if (isOpType(logMessages[0])) {
		// when not running as launcher concat the opType to the same
		// line with the relevant log
		const [lineOpType, line, ...rest] = logMessages;

		logMessages = [lineOpType + ' ' + line, ...rest];
	}

	logMessages.forEach(msg => logLine(msg, logMethod, fontColor, leftRail));
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
 * Prefix log with device id
 * @param {object} deviceDetails
 */
function devicePrefix(deviceDetails) {
	if (!deviceDetails)
		return 'Launcher ';

	return deviceDetails.shortDisplayName + ' ';
}

/**
 * Populate it with native node console methods
 */
Object.values(methods).forEach(method => {
	// create logger console method
	logger[method.key] = log(method);
});

module.exports = logger;
