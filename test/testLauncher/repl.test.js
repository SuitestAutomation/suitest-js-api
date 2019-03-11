const assert = require('assert');
const repl = require('repl');
const sinon = require('sinon');
const chokidar = require('chokidar');
const EventEmitter = require('events');

const logger = require('../../lib/utils/logger');
const envVars = require('../../lib/constants/enviroment');
const suitestRepl = require('../../lib/testLauncher/repl');
const ipcClient = require('../../lib/testLauncher/ipc/client');

const sandbox = require('sinon').createSandbox();

// mock repl instance
class ReplInstance extends EventEmitter {
	constructor(autoEnd = true) {
		super();
		this.context = {};
		this.close = sinon.stub();
		this.eval = (a, b, c, f) => f && f();
		this.defineCommand = sinon.stub();

		if (autoEnd)
			setTimeout(() => this.emitExit(), 10);
	}

	emitExit() {
		this.emit('exit');
	}
}

describe('repl', () => {
	before(() => {
		sinon.stub(console, 'error');
		sinon.stub(logger, 'error');
		sinon.stub(logger, 'debug');
		sinon.stub(logger, 'info');
		sinon.stub(logger, 'log');
	});

	after(() => {
		logger.error.restore();
		logger.log.restore();
		logger.debug.restore();
		logger.info.restore();
		console.error.restore();
	});

	beforeEach(() => {
		sandbox.stub(repl, 'start').returns(new ReplInstance());
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('startRepl', () => {
		const writeStub = sandbox.stub(ipcClient, 'write');
		const addListenerStub = sandbox.stub(ipcClient, 'addListener');

		process.env[envVars.SUITEST_CHILD_PROCESS] = 'test';

		const replPromsie = suitestRepl.startRepl({});

		assert.ok(writeStub.calledOnce);
		assert.ok(addListenerStub.calledOnce);
		assert.ok(replPromsie instanceof Promise);

		delete process.env[envVars.SUITEST_CHILD_PROCESS];
	});

	it('startRepl', () => {
		sandbox.stub(process, 'chdir');
		const writeStub = sandbox.stub(ipcClient, 'write');
		const addListenerStub = sandbox.stub(ipcClient, 'addListener');
		const replPromsie = suitestRepl.startRepl({});

		assert.ok(writeStub.notCalled);
		assert.ok(addListenerStub.notCalled);
		assert.ok(replPromsie instanceof Promise);
	});

	it('stopRepl', () => {
		process.env[envVars.SUITEST_CHILD_PROCESS] = 'test';
		const writeStub = sandbox.stub(ipcClient, 'write');

		suitestRepl.stopRepl();
		assert.ok(writeStub.calledOnce);
		delete process.env[envVars.SUITEST_CHILD_PROCESS];
	});

	it('should start REPL instance', async() => {
		sandbox.stub(ipcClient, 'write');
		process.stdin.setRawMode = sinon.stub();
		sandbox.stub(process, 'chdir');
		await suitestRepl.setupRepl({}, true);
		assert.ok(repl.start.called, 'Repl instance was started');
	});

	it('Should apply the repl options', async() => {
		const chDir = sandbox.stub(process, 'chdir');
		const choki = new EventEmitter();

		sandbox.stub(ipcClient, 'write');
		sinon.stub(console, 'log');

		try {
			sandbox.stub(chokidar, 'watch').returns(choki);
			choki.close = sinon.stub();

			const repeater = sinon.stub();
			const watch = '../../lib/utils/testHelpers/repl.js';

			repl.start.restore();
			sandbox.stub(repl, 'start').returns(new ReplInstance(false));

			require(watch);

			process.stdin.setRawMode = sinon.stub();

			suitestRepl.setupRepl({
				cwd: __dirname,
				repeater: repeater,
				watch: watch,
			}, false);

			await new Promise(resolve => {
				setInterval(() => chDir.called && resolve(), 10);
			});

			await new Promise(resolve => {
				choki.emit('change', watch);
				setInterval(() => {
					if (global.iHaveBeenRequired === 2 && repeater.called)
						resolve();
				});
			});
		} finally {
			console.log.restore();
		}
	});

	it('Should apply accept repeater as string', async() => {
		const replHelper = require('../../lib/utils/testHelpers/repl');
		let repeater = sandbox.stub(replHelper, 'repeater');
		let writeStub = sandbox.stub(ipcClient, 'write');
		const {repeaterFromString} = suitestRepl;
		const path = require('path');

		repeaterFromString(
			'repl#repeater',
			path.join(__dirname, '/../../lib/utils/testHelpers/'),
			''
		)();

		assert(repeater.called, 'Repeater with module spec was correctly resolved');

		repeater = sandbox.stub(replHelper.nested, 'repeater');

		writeStub.restore();
		writeStub = sandbox.stub(ipcClient, 'write');

		repeaterFromString(
			'repl#nested.repeater',
			path.join(__dirname, '/../../lib/utils/testHelpers/'),
			''
		)();

		assert(repeater.called, 'Nested repeater with module spec was correctly resolved');

		repeaterFromString(
			'nested.repeater',
			path.join(__dirname, '/../../lib/utils/testHelpers/'),
			'repl.js'
		)();

		assert(repeater.secondCall, 'Repeater without module name was correctly resolved');
	});
});
