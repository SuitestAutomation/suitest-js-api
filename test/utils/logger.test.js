const assert = require('assert');
const sinon = require('sinon');
const logger = require('../../lib/utils/logger');
const {extend, config} = require('../../config');

let cachedConfig;

describe('logger util', () => {
	before(() => {
		cachedConfig = {...config};
	});

	beforeEach(() => {
		sinon.stub(console, 'log');
		sinon.stub(console, 'info');
		sinon.stub(console, 'warn');
		sinon.stub(console, 'error');
	});

	afterEach(() => {
		console.log.restore();
		console.info.restore();
		console.warn.restore();
		console.error.restore();
		extend({...cachedConfig});
	});

	it('should display log, info, warn, error messages', () => {
		logger.log('log');
		logger.info('info');
		logger.warn('warn');
		logger.error('error');

		assert(console.log.called);
		assert(console.info.called);
		assert(console.warn.called);
		assert(console.error.called);
		assert(console.log.called);
	});

	it('should display debug message', () => {
		logger.debug('debug');

		assert(console.log.called);
	});

	it('should count for runningAsLauncher and repl in config', () => {
		logger.log('log');
		assert.strictEqual(!console.log.firstCall.args[0].includes('timestamp'), true, 'no timestamp by default');

		extend({
			runningAsLauncher: true,
			repl: false,
			timestamp: 'timestamp',
		});
		logger.log('log');
		assert.strictEqual(console.log.secondCall.args[0].includes('timestamp'), true, 'timestamp present if runningAsLauncher');

		extend({
			runningAsLauncher: true,
			repl: true,
			timestamp: 'timestamp',
		});
		logger.log('log');
		assert.strictEqual(!console.log.thirdCall.args[0].includes('timestamp'), true, 'no timestamp if repl');
	});
});
