const stackTrace = require('stack-trace');
const fs = require('fs');
const {EOL} = require('os');

const isSuitestMethod = require('./isSuitestMethod');
const {failedStackTrace} = require('../texts');

const errorStackLineRegexp = RegExp(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);

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
 * Parse error stack trace
 * @param {Error|undefined} [error]
 * @returns {string|Object} parsed or stringified stack trace
 * @example  [{
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
	return errorStackLineRegexp.test(s);
}

/**
 * Extract only file/line containing lines from error stack string
 * Optionally apply filtering to each line
 * @param {string} stack error stack string
 * @param {Function} [filterFunc] additional filtering function
 * @returns {string}
 */
function getStackLines(stack, filterFunc = i => i) {
	return stack.split(EOL).filter(l => isStackLine(l) && filterFunc(l)).join(EOL);
}

/**
 * Filter out suitest api related code lines fron error stack
 * @param {string} stack error stack
 * @returns {string}
 */
function stripSuitestCodeFromStack(stack) {
	const lines = getStackLines(stack);
	const updatedLines = getStackLines(lines, l => !isSuitestMethod(l));

	return stack.replace(lines, updatedLines);
}

/**
 * Prepend error stack with another one, excluding duplicated lines
 * @param {Error} error
 * @param {string} stack
 */
function prependStack(error, stack) {
	const oldLines = getStackLines(error.stack);
	const newLines = getStackLines(stack, l => !oldLines.includes(l));

	error.stack = stripSuitestCodeFromStack(error.stack.replace(
		oldLines,
		newLines + (newLines.length ? EOL : '') + oldLines),
	);

	return error;
}

module.exports = {
	stackTraceParser,
	fetchSource,
	stripSuitestCodeFromStack,
	prependStack,
};
