const colors = require('colors');
const {stackTraceParser, getFirstStackLine} = require('./stackTraceParser');
const {EOL} = require('os');
const {config} = require('../../config');
const logLevels = require('../constants/logLevels');
const {stripAnsiChars} = require('./stringUtils');

/**
 * Define custom colors
 */
const stColors = {
	suit: colors.grey,
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
		launcherColor: stColors.suit,
		consoleMethod: 'info',
		prefix: 'Info: ',
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
		color: 'blue',
		launcherColor: colors.blue,
		consoleMethod: 'log',
		prefix: 'Debug: ',
		levels: [
			logLevels.debug,
		],
	},
};

Object.freeze(methods);

/**
 * Logger function.
 * @param {*} method
 */
const log = method => (message, deviceId) => {
	// check if logging is allowed by logging level specified in config
	/* istanbul ignore if  */
	if (!method.levels.includes(config.logLevel))
		return;

	let prefix = method.prefix || '';

	// prefix log message with stack trace info
	/* istanbul ignore else  */
	if (config.logLevel === logLevels.verbose || method.key === 'debug') {
		const trace = stackTraceParser()[2];
		const frame = trace && trace[2];
		const str = JSON.stringify(frame) || '';

		if (str) {
			prefix += str + EOL;
		}
	}

	// log to console
	if (config.runningAsLauncher)
		return console[method.consoleMethod](method.launcherColor
			? method.launcherColor(devicePrefix(deviceId) + prefix + message)
			: stColors.suit(devicePrefix(deviceId)) + prefix + message
		);

	return console[method.consoleMethod](colors[method.color](prefix + message));
};

/**
 * Create logger object
 */
const logger = {
	levels: {...logLevels},
	colors: stColors,
};

/**
 * Prefix log with device id
 * @param {string} devId
 */
function devicePrefix(devId) {
	return devId ? 'Device ' + devId.slice(0, 8) + '> ' : '               > ';
}

/**
 * Populate it with native node console methods
 */
Object.values(methods).forEach(method => {
	// create logger console method
	logger[method.key] = log(method);
});

/**
 * Log error message in interactive mode
 * @param {string} message
 * @param {string} stack
 * @param {boolean} prefixAssertion
 */
logger.logError = (message, stack = '', prefix = '') => {
	const msg = stripAnsiChars(message);
	const firstStackLine = stack && getFirstStackLine(stack);
	const nl = firstStackLine && msg.endsWith(EOL) ? '' : EOL;

	logger.error(prefix + msg + nl + firstStackLine);
};

module.exports = logger;
