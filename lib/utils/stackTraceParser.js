const stackTrace = require('stack-trace');
const fs = require('fs');
const escapeRegexp = require('escape-string-regexp');

const isSuitestMethod = require('./isSuitestMethod');
const {failedStackTrace} = require('../texts');

/**
 * Fetch source code from stack trace frame
 * @param {Error} error
 * @param {Number} [contextSize=5] number of lines before and after error
 * @returns {Array<string>|undefined}
 */
function fetchSource(error, contextSize = 5) {
	const parsedStack = stackTraceParser(error);
	const frame = parsedStack[0];

	const sourceLines = fs.readFileSync(frame.file, 'utf8').replace(/\t/g, '  ').split('\n');
	const start = Math.max(frame.line - contextSize - 1, 0);
	const end = frame.line + contextSize;

	return sourceLines.slice(start, end);
}

/**
* @typedef {Object} StackTraceItem
* @property {number} line
* @property {number} column
* @property {string} function
* @property {string} file
*/

/**
 * Parse error stack trace
 * @param {Error|undefined} [error]
 * @returns {string|Array<StackTraceItem>} parsed or stringified stack trace
 * @example [{
 * 	"line": 4,
 *	"column": 11,
 *	"function": "Object.<anonymous>",
 *	"file": "/full/path/to/file.js",
 * }]
 * clientError: stackTrace item with source object
 */
function stackTraceParser(error) {
	error = error || new Error();

	try {
		return stackTrace.parse(error).map(frame => ({
			line: frame.lineNumber,
			column: frame.columnNumber,
			function: frame.functionName,
			file: frame.fileName,
		}));
	} catch (error) {
		/* istanbul ignore next */
		return failedStackTrace();
	}
}

/**
 * Test if string is node error stack line
 * @param {string} s
 * @returns {boolean}
 */
function isStackLine(s) {
	return s.trim().startsWith('at');
}

/**
 * Extract only file/line containing lines from error stack string
 * Optionally apply filtering to each line
 * @param {string} stack error stack string
 * @param {Function} [filterFunc] additional filtering function
 * @returns {string}
 */
function getStackLines(stack, filterFunc = i => i) {
	return stack.split('\n').filter(l => isStackLine(l) && filterFunc(l)).join('\n');
}

/**
 * Filter out suitest api related code lines from error stack
 * @param {string} stack error stack
 * @returns {string}
 */
function stripSuitestCodeFromStack(stack) {
	const lines = getStackLines(stack);
	const updatedLines = getStackLines(lines, l => !isSuitestMethod(l));

	return stack.replace(lines, updatedLines);
}

function stripAbsolutePaths(stack) {
	const cwdInStack = escapeRegexp(process.cwd()) + '(/|\\\\)';

	return stack
		.replace(new RegExp('\\(' + cwdInStack, 'g'), '(')
		.replace(new RegExp(cwdInStack, 'g'), '');
}

/**
 * Prepend error stack with another one, excluding duplicated lines
 * @param {string} stackA
 * @param {string} stackB
 * @param {boolean} [includeSuitestLines]
 * @returns {string}
 */
function prependStack(stackA, stackB, includeSuitestLines = false) {
	const oldLines = getStackLines(stackA);
	const newLines = getStackLines(stackB, l => !oldLines.includes(l));

	const stackProcessor = includeSuitestLines ? stack => stack : stripSuitestCodeFromStack;

	return stripAbsolutePaths(stackProcessor(stackA.replace(
		oldLines,
		newLines + (newLines.length ? '\n' : '') + oldLines),
	));
}

/**
 * Get first line from error stack
 * @param {string} stack
 * @returns {string}
 */
function getFirstStackLine(stack) {
	return stripAbsolutePaths(stripSuitestCodeFromStack(stack)).split('\n').find(isStackLine) || '';
}

/**
 * @description get first non suitest stack item.
 * @returns {void | StackTraceItem}
 */
function getFirstNotSuitestStackItem(error = new Error()) {
	/** @type {StackTraceItem[]} */
	const parsedStack = stackTraceParser(error);

	if (!Array.isArray(parsedStack)) {
		return;
	}

	return parsedStack.find(x => !isSuitestMethod(x.file));
}

/**
 * Remember call stack before function execution
 * If error is thrown, prepend error stack with cached stack
 * @param {Function} fn
 * @param {boolean} includeSuitestLines
 * @returns {Function}
 */
const stackTraceWrapper = (fn, includeSuitestLines) => {
	const stack = Error().stack;

	/* istanbul ignore next  */
	return async(...args) => {
		try {
			return await fn(...args);
		} catch (error) {
			error.stack = prependStack(error.stack, stack, includeSuitestLines);
			throw error;
		}
	};
};

module.exports = {
	stackTraceParser,
	fetchSource,
	stripSuitestCodeFromStack,
	prependStack,
	stackTraceWrapper,
	getFirstStackLine,
	getFirstNotSuitestStackItem,
	isStackLine,
	stripAbsolutePaths,
};
