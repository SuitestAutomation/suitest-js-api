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
});
