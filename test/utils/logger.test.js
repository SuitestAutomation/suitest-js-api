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
		sinon.stub(timestamp, 'formatDate').returns('timestamp');

		try {
			logger.log('|A|', 'operation');

			assert.equal(
				log.firstCall.args[0],
				'\u001b[90mtimestamp Launcher \u001b[39m\u001b[36m\u001b[1mA' +
				'\u001b[22m\u001b[39m \u001b[37moperation\u001b[39m',
				'In plain mode opType should be merged with line'
			);
		} finally {
			timestamp.formatDate.restore();
		}
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

		assert(log.firstCall.args[0].includes('MyDevice'), 'device short display name is included in left rail');
	});

	describe('appOutput method', () => {
		it('should display display data correctly', () => {
			logger.appOutput('log', [
				1,
				'text',
				null,
				false,
				['array', [1, 3, 4]],
				['object', {name: 1, age: 2}],
				['function', 'funcName'],
				['trace', [
					['funcName', 'fileName', 1],
					['funcName', 'fileName', 2],
				]],
			]);
			assert.strictEqual(console.log.lastCall.args[0], 1);
			assert.strictEqual(console.log.lastCall.args[1], 'text');
			assert.strictEqual(console.log.lastCall.args[2], null);
			assert.strictEqual(console.log.lastCall.args[3], false);
			assert.deepEqual(console.log.lastCall.args[4], [1, 3, 4]);
			assert.deepEqual(console.log.lastCall.args[5], {name: 1, age: 2});
			assert.strictEqual(console.log.lastCall.args[6], 'funcName');
			assert.strictEqual(
				console.log.lastCall.args[7],
				'funcName @ fileName:1\nfuncName @ fileName:2',
				'trace'
			);
		});

		it('should call correct console methods', () => {
			sinon.stub(console, 'assert');
			sinon.stub(console, 'dir');
			sinon.stub(console, 'table');

			try {
				logger.appOutput('assert');
				logger.appOutput('dir');
				logger.appOutput('table');

				assert.strictEqual(console.assert.calledOnce, true);
				assert.strictEqual(console.dir.calledOnce, true);
				assert.strictEqual(console.table.calledOnce, true);
			} finally {
				console.assert.restore();
				console.dir.restore();
				console.table.restore();
			}
		});

		it('should keep track of console timestamps', () => {
			logger.appOutput('time', undefined, 100);
			assert.strictEqual(logger.consoleTimestamps['default'], 100, 'added default timer');

			logger.appOutput('time', 'timer1', 100);
			assert.strictEqual(logger.consoleTimestamps['timer1'], 100, 'added custom timer');

			logger.appOutput('timeLog', 'timer2', 200);
			assert.strictEqual(
				console.warn.lastCall.args[0],
				'Timer \'timer2\' does not exist',
				'warn when no timer found'
			);

			logger.appOutput('timeLog', 'timer1', 200);
			assert.strictEqual(console.log.lastCall.args[0], 'timer1: 100ms', 'proper timeLog message');

			logger.appOutput('timeEnd', 'timer1', 300);
			assert.strictEqual(console.log.lastCall.args[0], 'timer1: 200ms', 'proper timeEnd message');
			assert.strictEqual('timer1' in logger.consoleTimestamps, false, 'on timeEnd timer deleted');
		});

		it('should display DOM element correctly', () => {
			logger.appOutput('log', [['element', {
				nodeType: 1,
				nodeName: 'div',
				attributes: {
					class: 'menu',
					id: 'main',
				},
				children: [{
					nodeType: 3,
					nodeValue: 'text content',
				}],
			}]]);
			assert.strictEqual(
				console.log.lastCall.args[0],
				'<div class="menu" id="main">text content</div>',
				'el with text node child'
			);

			logger.appOutput('log', [['element', {nodeType: 1, nodeName: 'div'}]]);
			assert.strictEqual(console.log.lastCall.args[0], '<div>...</div>', 'el without child');

			logger.appOutput('log', [['element', {nodeType: 3, nodeValue: 'text'}]]);
			assert.strictEqual(console.log.lastCall.args[0], '"text"', 'just text node');
		});
	});
});
