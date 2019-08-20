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

	describe('getAppOutput method', () => {
		it('should process data correctly', () => {
			const output = logger.getAppOutput('log', [
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
				['time', 'timer2', null],
				['count', 'count1', 42],
				['count', 'count2', null],
				['number', 'NaN'],
				['number', 'Infinity'],
				['number', '-Infinity'],
				['undefined'],
			]);

			assert.deepStrictEqual(output, {
				method: 'log',
				args: [
					1,
					'text',
					null,
					false,
					[1, 3, 4],
					{name: 1, age: 2},
					'funcName',
					'at foo...\nat bar...',
					'timer1: 42ms',
					'Timer \'timer2\' does not exist',
					'count1: 42',
					'Count for \'count2\' does not exist',
					NaN,
					Infinity,
					-Infinity,
					undefined,
				],
			});
		});

		it('should return nothing', () => {
			assert.strictEqual(logger.getAppOutput('time'), undefined);
		});

		it('should return correct console method and color', () => {
			assert.strictEqual(logger.getAppOutput('assert', []).method, 'log');
			assert.deepStrictEqual(logger.getAppOutput('assert', [1]).args, ['Assertion failed:', 1]);

			assert.strictEqual(logger.getAppOutput('dir').method, 'dir');
			assert.strictEqual(logger.getAppOutput('table').method, 'table');
			assert.deepStrictEqual(logger.getAppOutput('table', [['table', [1, 2]]]).args, [[1, 2]]);

			assert.strictEqual(logger.getAppOutput('timeLog', [['time', 'timer', 42]]).method, 'log');
			assert.deepStrictEqual(logger.getAppOutput('timeLog', [['time', 'timer', 42]]).args, ['timer: 42ms']);
			assert.deepStrictEqual(
				logger.getAppOutput('timeEnd', [['time', 'default', null]]).args,
				['Timer \'default\' does not exist']
			);

			assert.deepStrictEqual(
				logger.getAppOutput('trace', [['trace', ['at foo...', 'at bar...']]]).args,
				['at foo...\nat bar...']
			);
		});

		it('should process DOM element correctly', () => {
			assert.strictEqual(
				logger.getAppOutput('log', [['element', {
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
				}]]).args[0],
				`<div class="menu" id="main">${'1'.repeat(79)}…</div>`,
				'el with text node child'
			);

			assert.strictEqual(
				logger.getAppOutput('log', [['element', {nodeType: 1, nodeName: 'div'}]]).args[0],
				'<div>…</div>',
				'el without child'
			);

			assert.strictEqual(
				logger.getAppOutput('log', [['element', {nodeType: 3, nodeValue: 'text'}]]).args[0],
				'"text"',
				'just text node'
			);

			assert.strictEqual(
				logger.getAppOutput('log', [['element', {nodeType: 3, nodeValue: '1'.repeat(100)}]]).args[0],
				`"${'1'.repeat(79)}…"`,
				'text node trimmed'
			);
		});
	});
});
