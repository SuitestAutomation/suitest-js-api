const assert = require('assert');
const sinon = require('sinon');
const logger = require('../../lib/utils/logger');
const moment = require('moment');
const stripAnsiChars = require('../../lib/utils/stringUtils').stripAnsiChars;
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

	it('should log multiple messages in one function call', () => {
		const log = sinon.stub(console, 'log');

		logger.log('Plain log', 'lalala');

		assert(log.firstCall.args[0].includes('Plain log'));
		assert(log.secondCall.args[0].includes('lalala'));
		log.restore();
	});

	it('should log operation types in both modes', () => {
		const log = sinon.stub(console, 'log');

		logger.log('|A|', 'operation');

		assert(
			log.firstCall.args[0].includes('|A| operation'),
			'In plain mode opType should be merged with line'
		);

		log.resetHistory();
		config.runningAsLauncher = true;

		logger.log('|A| operation');

		assert(
			stripAnsiChars(log.secondCall.args[0]).includes('A operation'),
			'In launcher mode the op type should be parsed and colored'
		);

		config.runningAsLauncher = false;
		log.restore();
	});

	it('should display the name of the device in the left rail', () => {
		const log = sinon.stub(console, 'log');

		const device = {
			deviceId: '1',
			shortDisplayName: 'MyDevice',
		};

		config.runningAsLauncher = true;
		logger.log('operation', device);
		config.runningAsLauncher = false;

		const stripped = stripAnsiChars(log.secondCall.args[0]);

		assert(stripped.includes('MyDevice'), 'device short display name is included in left rail');
		assert(!stripped.includes('shortDisplayName'), 'and it is properly parsed');
		log.restore();
	});

	it('should only add timestamp in launcher mode', () => {
		const log = sinon.stub(console, 'log');
		const dateFormat = 'MMM D HH:mm:ss';

		logger.log('lalala');

		let out = stripAnsiChars(log.firstCall.args[0]);

		assert(!moment(out, dateFormat).isValid(), 'Must not have timestamp in plain mode');

		config.runningAsLauncher = true;

		log.resetHistory();

		logger.log('lalala');
		assert.equal(log.firstCall.args[0], '', 'Initialization call should produce new line');

		out = stripAnsiChars(log.secondCall.args[0]);
		assert(moment(out, dateFormat).isValid(), 'Must have timestamp in launcher mode');

		log.restore();
		config.runningAsLauncher = false;
	});
});
