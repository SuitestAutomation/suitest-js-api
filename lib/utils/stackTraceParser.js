const stackTrace = require('stack-trace');
const fs = require('fs');

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
 * Parse error stack trace
 * @param {Error|undefined} error
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

module.exports = {
	stackTraceParser,
	fetchSource,
};
