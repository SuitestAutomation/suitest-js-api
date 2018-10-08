const assert = require('assert');
const sinon = require('sinon');
const logger = require('../../lib/utils/logger');
const {extend, config} = require('../../config');
const timestamp = require('../../lib/utils/timestamp');
const {pairedDeviceContext} = require('../../lib/context');

let cachedConfig;
let log;

describe('logger util', () => {
	before(() => {
		cachedConfig = {...config};
	});

	beforeEach(() => {
		log = sinon.stub(console, 'log');
		sinon.stub(console, 'info');
		sinon.stub(console, 'warn');
		sinon.stub(console, 'error');
	});

	afterEach(() => {
		log.restore();
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

	it('should log multiple messages in one function call', () => {
		logger.log('Plain log', 'lalala');

		assert(log.firstCall.args[0].indexOf('Plain log') !== -1);
		assert(log.secondCall.args[0].includes('lalala') !== -1);
	});

	it('should log operation type', () => {
		sinon.stub(timestamp, 'format').returns('timestamp');

		logger.log('|A|', 'operation');

		assert.equal(
			log.firstCall.args[0],
			'\u001b[90mtimestamp Launcher \u001b[39m\u001b[36m\u001b[1mA\u001b[22m\u001b[39m \u001b[37moperation\u001b[39m',
			'In plain mode opType should be merged with line'
		);
	});

	it('should display the name of the device in the left rail', () => {
		const device = {
			deviceId: 'abcde',
			shortDisplayName: 'MyDevice',
			model: 'Model',
			manufacturer: 'Manufacturer',
		};

		pairedDeviceContext.setContext(device);

		logger.log('operation');

		assert(log.secondCall.args[0].includes('MyDevice'), 'device short display name is included in left rail');
	});
});
