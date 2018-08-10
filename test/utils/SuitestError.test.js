const assert = require('assert');
const sinon = require('sinon');
const SuitestError = require('../../lib/utils/SuitestError');
const logger = require('../../lib/utils/logger');
const suitest = require('../../index');
const {API_CONSTRUCTOR_NAME, API_LIB_PATH_IDENTIFIERS} = require('../../lib/constants');

describe('SuitestError', () => {
	before(() => {
		sinon.stub(logger, 'info');
	});

	after(() => {
		logger.info.restore();
	});

	it('should extend Error', () => {
		assert(new SuitestError() instanceof Error);
	});

	it('should accept error message and code as parameters', () => {
		const err = new SuitestError('test', SuitestError.AUTH_NOT_ALLOWED);

		assert.strictEqual(err.message, 'test', 'error message');
		assert.strictEqual(err.code, SuitestError.AUTH_NOT_ALLOWED, 'error code');
	});

	it('should have suitest identifier', () => {
		const err = new SuitestError('test', SuitestError.AUTH_NOT_ALLOWED);

		assert.strictEqual(err.type, SuitestError.type, 'suitest error type');
	});

	it('should have source prop', () => {
		const err = new SuitestError('test', SuitestError.AUTH_NOT_ALLOWED);

		assert.ok(err.info, 'info');
		assert.ok(err.info.source, 'source');
	});

	it('should have stack filtered from suitest code errors', async() => {
		try {
			await suitest.closeSession();
		} catch (err) {
			assert.ok(err, 'error');
			assert.ok(err.stack, 'stack');
			assert.strictEqual(err.stack.split('\n').some(l => {
				return l.includes(API_CONSTRUCTOR_NAME) || l.includes(API_LIB_PATH_IDENTIFIERS[0]);
			}), false);
		}
	});

	it('should have exit method', () => {
		sinon.stub(process, 'exit');
		sinon.stub(console, 'error');

		try {
			const err = new SuitestError('test', SuitestError.AUTH_NOT_ALLOWED);

			assert.ok(err.exit, 'exit');
			assert.ok(typeof err.exit === 'function', 'exit is function');

			err.exit();
			assert(process.exit.calledWith(1));
			assert(process.exit.called);

			err.exit(0);
			assert(process.exit.calledWith(0));
			assert(process.exit.called);
		} finally {
			process.exit.restore();
			console.error.restore();
		}
	});

	it('unknown error', () => {
		const err = new SuitestError();

		assert.equal(err.code, SuitestError.UNKNOWN_ERROR);
		assert.equal(err.message, 'Unknown error occurred. If you keep getting this error please get in touch with support@suite.st. If you haven\'t turned off automatic error reporting (the disallowCrashReports option in config) we are already working hard to fix the issue.');
	});
});
