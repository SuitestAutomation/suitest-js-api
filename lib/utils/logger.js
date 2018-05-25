const colors = require('colors');
const {stackTraceParser} = require('./stackTraceParser');

const {config} = require('../../config');
const logLevels = require('../constants/logLevels');

const methods = {
	log: {
		key: 'log',
		color: 'white',
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
		color: 'green',
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
const log = method => (...args) => {
	// check if logging is allowed by logging level specified in config
	/* istanbul ignore if  */
	if (!method.levels.includes(config.logLevel)) {
		return;
	}

	let prefix = '\n' + method.prefix;

	// prefix log message with stack trace info
	/* istanbul ignore else  */
	if (config.logLevel === logLevels.verbose || method.key === 'debug') {
		const trace = stackTraceParser()[2];
		const frame = trace && trace[2];
		const str = JSON.stringify(frame) || '';

		prefix += ' ' + str + '\n';
	}

	// log to console
	console[method.consoleMethod](colors[method.color](prefix, ...args));
};

/**
 * Create logger object
 */
const logger = {
	levels: {...logLevels},
};

/**
 * Populate it with native node console methods
 */
Object.values(methods).forEach(method => {
	// create logger console method
	logger[method.key] = log(method);
});

module.exports = logger;

module.exports.logVerboseMessage = (...args) => {
	if (config.logLevel === logLevels.debug) {
		logger.debug(...args);
	} else if (config.logLevel === logLevels.verbose) {
		logger.info(...args);
	}

	return [...args];
};
