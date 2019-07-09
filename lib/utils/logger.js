const colors = require('colors');
const {config} = require('../../config');
const logLevels = require('../constants/logLevels');
const {pairedDeviceContext} = require('../../lib/context');
const jsonRenderer = require('prettyjson');
const {formatOpType} = require('./opType');
const timestamp = require('./timestamp');
const {truncate} = require('./stringUtils');

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
	warn: colors.yellow,
	info: colors.blue,
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
			logLevels.silly,
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
			logLevels.silly,
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
			logLevels.silly,
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
			logLevels.silly,
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
			logLevels.silly,
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
			logLevels.silly,
		],
	},
	debug: {
		key: 'debug',
		color: colors.blue,
		consoleMethod: 'log',
		prefix: 'Debug: ',
		levels: [
			logLevels.debug,
			logLevels.silly,
		],
	},
	silly: {
		key: 'silly',
		color: colors.blue,
		consoleMethod: 'log',
		prefix: 'Silly: ',
		levels: [
			logLevels.silly,
		],
	},
};

Object.freeze(methods);

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
	const {opType, logString} = formatOpType(String(messages[0]));

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
	if (lastLogSource && logSource !== lastLogSource) {
		logLine('', consoleMethod, fontColor, '');
		lastLogSource = logSource;
	}

	const timeAndDevice = timestamp.formatDate() + ' ' + logSource;
	const leftRail = stColors.gray(timeAndDevice) + stColors.bold(opType) + ' ';

	logMessages.forEach(msg => logLine(msg, consoleMethod, fontColor, leftRail));
};

let delayedLog;
/**
 * Create logger object
 */
const logger = {

	levels: {...logLevels},
	colors: stColors,

	delayed: (message, showAfter = 2e3) => {
		clearTimeout(delayedLog);
		delayedLog = setTimeout(() => {
			logger.info(message);
		}, showAfter);
	},

	intro: (message, ...params) => {
		const paintedParams = params.map(param => stColors.bold(param));

		logger.log(stColors.suit(message(...paintedParams)));
	},

	json: (obj) => {
		clearTimeout(delayedLog);
		console.log(jsonRenderer.render(obj));
	},

	/**
	 * @typedef {['object', object]
	 * | ['array', any[]]
	 * | ['element', ElementStruct]
	 * | ['function', string]
	 * | ['NaN']
	 * | ['table', [any[], any[]]]
	 * | ['time', string, number | null]
	 * | ['trace', string[]}
	 * | ['undefined'] ComplexStruct
	 *
	 * @typedef {'log' | 'error' | 'warn' | 'info' | 'debug' | 'assert' | 'clear' | 'count' | 'countReset' |
	 * 'dir' | 'dirxml' | 'group' | 'groupCollapsed' | 'groupEnd' | 'table' | 'time' | 'timeEnd' |
	 * 'timeLog' | 'trace'} Subtype
	 */

	/**
	 * Log console output from device which are delivered in WS 'console' messages.
	 * @param {Subtype} subtype - console method
	 * @param {string | Array<string | number | boolean | null | ComplexStruct} data - data to log
	 * @param {number} time - required for subtype 'time' | 'timeEnd' | 'timeLog'
	 */
	appOutput: (subtype, data, time) => {
		if (config.logLevel === logLevels.silent || subtype === 'time') {
			return;
		}

		// Time logs and trace are displayed with console.log and data from device.
		let method = ['timeEnd', 'timeLog', 'trace'].includes(subtype) ? 'log' : subtype;

		if (typeof data === 'string' || typeof data === 'undefined') {
			data = [data];
		}

		// Pick logging color
		let color;

		if (subtype === 'info') {
			color = stColors.info;
		} else if (subtype === 'warn') {
			color = stColors.warn;
		} else if (subtype === 'error' || subtype === 'assert' && data[0] === false) {
			color = stColors.errorColor;
		}

		const args = data.map(d => {
			// If not an array, display as it is.
			if (!Array.isArray(d)) {
				return d;
			}

			const [struct, val1, val2] = d;

			// If NaN, undefined display as strings
			if (struct === 'NaN' || struct === 'undefined') {
				return struct;
			}

			// If null, display as strings, because colors module crashes tries to color null
			if (struct === null) {
				return 'null';
			}

			// If element, diaplay as DOM el with textContent if present, do not show inner elements.
			if (struct === 'element') {
				// Text node.
				if (val1.nodeType === 3) {
					return `"${truncate(val1.nodeValue, 80)}"`;
				}
				// Element node.
				const attrs = val1.attributes
					? Object.entries(val1.attributes).map(([attr, val]) => ` ${attr}="${val}"`).join('')
					: '';
				const child = val1.children && val1.children[0].nodeValue.match(/[a-zA-Z0-9]/)
					? truncate(val1.children[0].nodeValue, 80) : '…';
				const el = `<${val1.nodeName}${attrs}>${child}</${val1.nodeName}>`;

				return el;
			}

			// If trace, form stack frames and display each on new line.
			if (struct === 'time') {
				if (val2 === null) {
					method = 'warn';

					return `Timer '${val1}' does not exist`;
				}

				return `${val1}: ${val2}ms`;
			}

			// If trace, form stack frames and display each on new line.
			if (struct === 'trace') {
				return '\n' + val1.join('\n');
			}

			// Everything else is displayed correctly natively.
			return val1;
		});

		// Display prefix line
		if (!['group', 'groupEnd', 'groupCollapsed'].includes(subtype)) {
			console.log(`${stColors.gray(timestamp.formatDate(time) + devicePrefix())} ${stColors.bold('App log:')}`);
		}

		// Display actual device log
		if (color) {
			console[method](color(...args));
		} else {
			console[method](...args);
		}
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
