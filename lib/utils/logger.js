const colors = require('colors');
const moment = require('moment');
const jsonRenderer = require('prettyjson');

const {config} = require('../../config');
const logLevels = require('../constants/logLevels');
const {formatOpType} = require('./opType');
const timestampOff = require('../constants/timestamp').none;
const {pairedDeviceContext} = require('../../lib/context');

/**
 * Define custom colors
 */
const stColors = {
	gray: colors.gray,
	suit: colors.white,
	mild: colors.cyan,
	bold: colors.cyan.bold,
	magenta: colors.magenta,
	errorColor: colors.red,
	successColor: colors.green,
};

const methods = {
	success: {
		key: 'success',
		color: stColors.successColor,
		consoleMethod: 'log',
		levels: [
			logLevels.normal,
			logLevels.verbose,
			logLevels.debug,
		],
	},
	special: {
		key: 'special',
		color: stColors.magenta,
		consoleMethod: 'log',
		levels: [
			logLevels.normal,
			logLevels.verbose,
			logLevels.debug,
		],
	},
	log: {
		key: 'log',
		color: colors.white,
		consoleMethod: 'log',
		levels: [
			logLevels.normal,
			logLevels.verbose,
			logLevels.debug,
		],
	},
	info: {
		key: 'info',
		color: stColors.gray,
		consoleMethod: 'info',
		prefix: '',
		levels: [
			logLevels.verbose,
			logLevels.debug,
		],
	},
	warn: {
		key: 'warn',
		color: colors.yellow,
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
		color: stColors.errorColor,
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
		color: colors.blue,
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
 */
function devicePrefix() {
	const device = pairedDeviceContext.context;

	if (!device || !device.shortDisplayName)
		return 'Launcher ';

	return device.shortDisplayName + ' ';
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
		jsonRenderer.render(obj) : String(msg);

	lines.split('\n').forEach(line => logMethod(leftRail + fontColor(line)));

	// add empty line after object rendering for better orientation
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
 * Suitest logger
 * Matches the standard console interface.
 * @param {...*} messages - things to log.
 */
const log = method => (...messages) => {
	// check if logging is allowed by logging level specified in config
	/* istanbul ignore if  */
	if (!method.levels.includes(config.logLevel))
		return;

	clearTimeout(delayedLog);

	const fontColor = method.color || stColors.suit;
	const consoleMethod = console[method.consoleMethod];
	// eslint-disable-next-line prefer-const
	let {opType, logMessages} = extractOpType(messages);

	const logSource = devicePrefix();

	// log empty line with the left rail to separate logs of
	// different devices and own launcher logs from one another.
	if (logSource !== lastLogSource) {
		logLine('', consoleMethod, fontColor, '');
		lastLogSource = logSource;
	}

	if (opType)
		opType += ' ';

	const timeAndDevice = timestamp() + ' ' + logSource;
	const leftRail = stColors.gray(timeAndDevice) + stColors.bold(opType);

	logMessages.forEach(msg => logLine(msg, consoleMethod, fontColor, leftRail));
};

let delayedLog;
/**
 * Create logger object
 */
const logger = {

	levels: {...logLevels},
	colors: stColors,
	delayed: (message, showAfter) => {
		clearTimeout(delayedLog);
		delayedLog = setTimeout(() => {
			logger.info(message);
		}, showAfter);
	},
	json: (obj) => {
		clearTimeout(delayedLog);
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
