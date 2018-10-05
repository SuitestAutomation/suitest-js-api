const assert = require('assert');
const repl = require('repl');
const sinon = require('sinon');
const chokidar = require('chokidar');
const EventEmitter = require('events');

const texts = require('../../lib/texts');
const SuitestError = require('../../lib/utils/SuitestError');
const suitestRepl = require('../../lib/testLauncher/repl');
const errorListeners = require('../../lib/utils/errorListeners');
const {setupReplIpc} = require('../../lib/utils/testLauncherHelper');

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
			setInterval(() => this.emitExit(), 10);
	}

	emitExit() {
		this.emit('exit');
	}
}

async function ensureReplPortExists(mock = false) {
	const mockPort = '9999';
	const current = process.env.REPL_IPC_PORT;

	if (mock)
		return process.env.REPL_IPC_PORT = mockPort;
	else if (!current || current === mockPort)
		process.env.REPL_IPC_PORT = await setupReplIpc();
}

describe('repl', () => {
	beforeEach(() => {
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
			assert.equal(e.code, SuitestError.IPC_ERROR, 'Error code is correct');
			assert.ok(replIpcNotAvailable.called, 'Error message is correct');
			passed = true;
		}

		assert.ok(passed, 'Error was not thrown when it should have been.');
		process.env.REPL_IPC_PORT = port;
	});

	it('should handle IPC startup error', async() => {
		const replIpcErrorInChildProcess = sandbox.stub(texts, 'replIpcErrorInChildProcess');

		await ensureReplPortExists(true);

		suitestRepl.startRepl();

		return new Promise(resolve => {
			let error = false;
			const errListeners = errorListeners.pauseErrorListeners();

			process.on('uncaughtException', function check(e) {
				try {
					assert.ok(replIpcErrorInChildProcess.called, 'Connection error was thrown');
					assert.equal(e.code, SuitestError.IPC_ERROR, 'Error code was correct');
				} catch (e) {
					error = e;
				}

				errorListeners.restoreErrorListeners(errListeners);

				if (error)
					throw error;

				resolve();
			});
		});
	});

	it('should start REPL instance', async() => {
		process.stdin.setRawMode = sinon.stub();
		sandbox.stub(process, 'chdir');
		await ensureReplPortExists();
		await suitestRepl.startRepl({});
		assert.ok(repl.start.called, 'Repl instance was started');
	});

	it('Should apply the repl options', async() => {
		const chDir = sandbox.stub(process, 'chdir');
		const choki = new EventEmitter();

		sandbox.stub(chokidar, 'watch').returns(choki);
		choki.close = sinon.stub();

		const repeater = sinon.stub();
		const watch = '../../lib/utils/testHelpers/repl.js';

		await ensureReplPortExists();

		repl.start.restore();
		sandbox.stub(repl, 'start').returns(new ReplInstance(false));

		require(watch);

		process.stdin.setRawMode = sinon.stub();

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

	it('Should apply accept repeater as string', async() => {
		const replHelper = require('../../lib/utils/testHelpers/repl');
		let repeater = sandbox.stub(replHelper, 'repeater');

		const {repeaterFromString} = suitestRepl;
		const path = require('path');

		repeaterFromString(
			'repl#repeater',
			path.join(__dirname, '/../../lib/utils/testHelpers/'),
			''
		)();

		assert(repeater.called, 'Repeater with module spec was correctly resolved');

		repeater = sandbox.stub(replHelper.nested, 'repeater');

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
