const assert = require('assert');
const repl = require('repl');
const sinon = require('sinon');
const chokidar = require('chokidar');
const EventEmitter = require('events');

const texts = require('../../lib/texts');
const SuitestError = require('../../lib/utils/SuitestError');
const suitestRepl = require('../../lib/testLauncher/repl');

const sandbox = require('sinon').createSandbox();

// mock repl instance
class ReplInstance extends EventEmitter {
	constructor(autoEnd = true) {
		// console.log('booooo');
		super();
		this.context = {};
		this.close = sinon.stub();
		this.eval = (a, b, c, f) => f && f();
		this.defineCommand = sinon.stub();

		if (autoEnd)
			setInterval(() => this.emitExit(), 10);
	}

	emitExit() {
		this.emit('exit');
	}
}

describe('repl', () => {
	beforeEach(() => {
		process.env.REPL_IPC_PORT = '9999';
		sandbox.stub(repl, 'start').returns(new ReplInstance());
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should require IPC port', () => {
		const replIpcNotAvailable = sandbox.stub(texts, 'replIpcNotAvailable');
		const port = process.env.REPL_IPC_PORT;

		delete process.env.REPL_IPC_PORT;

		const {startRepl} = suitestRepl;
		let passed = false;

		try {
			startRepl();
		} catch (e) {
			console.log(replIpcNotAvailable.called);
			assert.equal(e.code, SuitestError.IPC_ERROR, 'Error code is correct');
			assert.ok(replIpcNotAvailable.called, 'Error message is correct');
			passed = true;
		}

		assert.ok(passed, 'Error was not thrown when it should have been.');
		process.env.REPL_IPC_PORT = port;
	});

	it('should handle IPC startup error', async() => {
		const replIpcErrorInChildProcess = sandbox.stub(texts, 'replIpcErrorInChildProcess');

		suitestRepl.startRepl();

		return new Promise(resolve => {
			let error = false;

			process.removeAllListeners('uncaughtException');
			process.on('uncaughtException', function check(e) {
				try {
					assert.ok(replIpcErrorInChildProcess.called, 'Connection error was thrown');
					assert.equal(e.code, SuitestError.IPC_ERROR, 'Error code was correct');
				} catch (e) {
					error = e;
				}

				process.removeListener('unhandledException', check);

				if (error)
					throw error;

				resolve();
			});
		});
	});

	it('should start REPL instance', async() => {
		const {setupReplIpc} = require('../../lib/utils/testLauncherHelper');

		process.stdin.setRawMode = sinon.stub();
		process.env.REPL_IPC_PORT = await setupReplIpc();
		sandbox.stub(process, 'chdir');

		await suitestRepl.startRepl({});
		assert.ok(repl.start.called, 'Repl instance was started');
	});

	it('Should apply the repl options', async() => {
		const chDir = sandbox.stub(process, 'chdir');
		const choki = new EventEmitter();

		sandbox.stub(chokidar, 'watch').returns(choki);
		choki.close = sinon.stub();

		const {setupReplIpc} = require('../../lib/utils/testLauncherHelper');
		const repeater = sinon.stub();
		const watch = '../../lib/utils/testHelpers/repl.js';

		repl.start.restore();
		sandbox.stub(repl, 'start').returns(new ReplInstance(false));

		require(watch);

		process.stdin.setRawMode = sinon.stub();
		process.env.REPL_IPC_PORT = await setupReplIpc();

		suitestRepl.startRepl({
			cwd: __dirname,
			repeater: repeater,
			watch: watch,
		});

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
	});
});
