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
		it('should display data correctly', () => {
			logger.appOutput('log', [
				1,
				'text',
				null,
				false,
				['array', [1, 3, 4]],
				['object', {name: 1, age: 2}],
				['function', 'funcName'],
				['trace', [
					['at foo...'],
					['at bar...'],
				]],
				['time', 'timer1', 42],
				['NaN'],
				['undefined'],
			]);
			assert.strictEqual(console.log.lastCall.args[0], 1);
			assert.strictEqual(console.log.lastCall.args[1], 'text');
			assert.strictEqual(console.log.lastCall.args[2], null);
			assert.strictEqual(console.log.lastCall.args[3], false);
			assert.deepEqual(console.log.lastCall.args[4], [1, 3, 4]);
			assert.deepEqual(console.log.lastCall.args[5], {name: 1, age: 2});
			assert.strictEqual(console.log.lastCall.args[6], 'funcName');
			assert.strictEqual(console.log.lastCall.args[7], '\nat foo...\nat bar...', 'trace');
			assert.strictEqual(console.log.lastCall.args[8], 'timer1: 42ms');
			assert.strictEqual(console.log.lastCall.args[9], 'NaN');
			assert.strictEqual(console.log.lastCall.args[10], 'undefined');
		});

		it('should call correct console methods', () => {
			const timeLogSupport = 'timeLog' in console;

			sinon.stub(console, 'assert');
			sinon.stub(console, 'dir');
			sinon.stub(console, 'table');
			sinon.stub(console, 'time');
			if (timeLogSupport) {
				sinon.stub(console, 'timeLog');
			}
			sinon.stub(console, 'timeEnd');
			sinon.stub(console, 'trace');

			try {
				logger.appOutput('assert');
				logger.appOutput('dir');
				logger.appOutput('table');
				assert.strictEqual(console.assert.calledOnce, true);
				assert.strictEqual(console.dir.calledOnce, true);
				assert.strictEqual(console.table.calledOnce, true);

				logger.appOutput('time', [['time', 'timer', 42]]);
				assert.strictEqual(console.time.called, false);

				if (timeLogSupport) {
					logger.appOutput('timeLog', [['time', 'timer', 42]]);
					assert.strictEqual(console.timeLog.called, false);
					assert.strictEqual(console.log.lastCall.args[0], 'timer: 42ms');
				}

				logger.appOutput('timeEnd', [['time', 'default', null]]);
				assert.strictEqual(console.timeEnd.called, false);
				assert.strictEqual(console.warn.lastCall.args[0], 'Timer \'default\' does not exist');

				logger.appOutput('trace', [['trace', ['at foo...', 'at bar...']]]);
				assert.strictEqual(console.trace.called, false);
				assert.strictEqual(console.log.lastCall.args[0], '\nat foo...\nat bar...');
			} finally {
				console.assert.restore();
				console.dir.restore();
				console.table.restore();
				console.time.restore();
				if (timeLogSupport) {
					console.timeLog.restore();
				}
				console.timeEnd.restore();
				console.trace.restore();
			}
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
					nodeValue: '1'.repeat(100),
				}],
			}]]);
			assert.strictEqual(
				console.log.lastCall.args[0],
				`<div class="menu" id="main">${'1'.repeat(79)}…</div>`,
				'el with text node child'
			);

			logger.appOutput('log', [['element', {nodeType: 1, nodeName: 'div'}]]);
			assert.strictEqual(console.log.lastCall.args[0], '<div>…</div>', 'el without child');

			logger.appOutput('log', [['element', {nodeType: 3, nodeValue: 'text'}]]);
			assert.strictEqual(console.log.lastCall.args[0], '"text"', 'just text node');

			logger.appOutput('log', [['element', {nodeType: 3, nodeValue: '1'.repeat(100)}]]);
			assert.strictEqual(console.log.lastCall.args[0], `"${'1'.repeat(79)}…"`, 'text node trimmed');
		});
	});
});
