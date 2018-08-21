/* istanbul ignore file */

const sinon = require('sinon');
const mock = require('mock-require');

/**
 * REPL module
 */
mock('repl', {
	start: sinon.stub().returns({
		close: () => void 0,
		context: {},
	}),
});
