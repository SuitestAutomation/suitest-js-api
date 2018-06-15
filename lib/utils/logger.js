const colors = require('colors');
const {stackTraceParser} = require('./stackTraceParser');
const {EOL} = require('os');
const {config} = require('../../config');
const logLevels = require('../constants/logLevels');
const {SUITEST_LAUNCHER_PROCESS} = require('../constants/enviroment');

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
	log: {
		key: 'log',
		color: 'white',
		launcherColor: null,
		consoleMethod: 'log',
		prefix: '',
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
		prefix: 'Info:',
		levels: [
			logLevels.verbose,
			logLevels.debug,
		],
	},
	warn: {
		key: 'warn',
		color: 'yellow',
		launcherColor: null,
		consoleMethod: 'warn',
		prefix: 'Warning:',
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
		prefix: 'Error:',
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
		launcherColor: null,
		consoleMethod: 'log',
		prefix: 'Debug:',
		levels: [
			logLevels.verbose,
			logLevels.debug,
		],
	},
};

Object.freeze(methods);

/**
 * Logger function.
 * @param {*} method
 */
const log = (method, consoleType) => (...args) => {
	// check if logging is allowed by logging level specified in config
	/* istanbul ignore if  */
	if (!method.levels.includes(config.logLevel)) {
		return;
	}

	let prefix = method.prefix;

	// prefix log message with stack trace info
	/* istanbul ignore else  */
	if (config.logLevel === logLevels.verbose || method.key === 'debug') {
		const trace = stackTraceParser()[2];
		const frame = trace && trace[2];
		const str = JSON.stringify(frame) || '';

		prefix += ' ' + str + EOL;
	}

	// log to console
	if (consoleType === 'lib') {
		console[method.consoleMethod](colors[method.color](prefix, ...args));
	} else if (consoleType === 'launcher') {
		console[method.consoleMethod](method.launcherColor
			? method.launcherColor(devicePrefix(args[1]), args[0])
			: stColors.suit(devicePrefix(args[1])) + args[0]
		);
	} else {
		console[method.consoleMethod](colors[method.color](...args));
	}
};

/**
 * Create logger objects
 */
const libLogger = {
	levels: {...logLevels},
	colors: stColors,
};

const launcherLogger = {
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
	libLogger[method.key] = log(method, 'lib');
	launcherLogger[method.key] = log(method, 'launcher');
});

// add special method for launcher console
launcherLogger.success = (...args) => launcherLogger.log(stColors.successColor(...args));

if (process.env[SUITEST_LAUNCHER_PROCESS] === 'main') {
	module.exports = launcherLogger;
} else {
	module.exports = libLogger;
}

module.exports.libLogger = libLogger;
module.exports.launcherLogger = launcherLogger;
