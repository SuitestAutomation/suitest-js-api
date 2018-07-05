const assert = require('assert');
const sinon = require('sinon');
const logger = require('../../lib/utils/logger');

describe('logger util', () => {
	it('should display log, info, warn, error messages', () => {
		sinon.stub(console, 'log');
		sinon.stub(console, 'info');
		sinon.stub(console, 'warn');
		sinon.stub(console, 'error');

		logger.log('log');
		logger.info('info');
		logger.warn('warn');
		logger.error('error');

		try {
			assert(console.log.called);
			assert(console.info.called);
			assert(console.warn.called);
			assert(console.error.called);
			assert(console.log.called);
		} finally {
			console.log.restore();
			console.info.restore();
			console.warn.restore();
			console.error.restore();
		}
	});

	it('should display debug message', () => {
		sinon.stub(console, 'log');

		logger.debug('debug');

		try {
			assert(console.log.called);
		} finally {
			console.log.restore();
		}
	});

	it('should test logError', () => {
		const info = sinon.stub(console, 'error');

		logger.logError('message', 'stack\n\tat line1\n\tat line2', 'prefix ');
		assert.strictEqual(info.called, true);
		assert.strictEqual(info.firstCall.args[0].includes('prefix message'), true);
		assert.strictEqual(info.firstCall.args[0].includes('at line1'), true);
		assert.strictEqual(info.firstCall.args[0].includes('at line2'), false);
		info.restore();
	});
});
