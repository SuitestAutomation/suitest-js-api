const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const repl = require('../../lib/testLauncher/repl');
const texts = require('../../lib/texts');
const suitest = require('../../index');
const {logger} = suitest;
const startREPL = require('../../lib/commands/startREPL');

describe('startREPL command', () => {
	let suitestConfig;

	before(() => {
		process.env.REPL_IPC_PORT = 'fake';
	});

	beforeEach(() => {
		sinon.stub(logger);
		suitestConfig = suitest.config;
		suitest.config = {
			...suitestConfig,
			runsOnSingleDevice: true,
		};
	});
	afterEach(() => {
		sinon.restore();
		suitest.config = suitestConfig;
	});
	it('should not start another repl instance if one is already running', async() => {
		const replSessionEnded = sinon.stub(texts, 'replSessionEnded');

		let startRepl;
		let replCalls = 0;

		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async resolve => {
			startRepl = sinon.stub(repl, 'startRepl').callsFake(async() => {
				await startREPL();
				++replCalls;
				assert.strictEqual(replCalls, 1, 'Second call is ignored');
				process.nextTick(resolve);
			});
			await startREPL();
		}).then(async() => {
			startRepl.restore();
			startRepl = sinon.stub(repl, 'startRepl').returns(Promise.resolve());

			await startREPL();
			assert.strictEqual(
				replSessionEnded.callCount,
				2,
				'Repl went through exactly 2x although 3 attempts where made',
			);
		}).then(() => {
			startRepl.restore();
			replSessionEnded.restore();
		});
	});

	it('should not give warning for single device and give warning for several devices', async() => {
		const replWarn = sinon.stub(texts, 'replWarn');
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);

		await startREPL();
		assert.ok(!replWarn.called, 'Warning not displayed when runsOnSingleDevice is true');
		suitest.config.runsOnSingleDevice = false;
		await startREPL();
		assert.ok(replWarn.called, 'Warning displayed when runsOnSingleDevice is false');

		startRepl.restore();
		replWarn.restore();
	});

	it('should print the welcome message describing all launch settings', async() => {
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);
		const replWelcomeMessage = sinon.spy(texts, 'replWelcomeMessage');

		const suitColor = logger.colors.suit;
		// eslint-disable-next-line max-len
		const expected = 'Test execution has been paused for the interactive session\nNow you can:\n\n  1. Edit watched files - Suitest will reload them and execute the repeater\n     function every time they change on disk.\n  2. Use the prompt below to execute any JavaScript in real time.\n\nHere is your environment:\n\n  Current working dir: ' + suitColor(__dirname) + '\n  Repeater function: ' + suitColor('none') + '\n  Available local variables: ' + suitColor('suitest') + '\n  Watched files (relative to your working dir):\n    - ' + suitColor(path.join(__dirname, '/**/*.js')) + '\n\n';

		await startREPL();

		assert.strictEqual(replWelcomeMessage.firstCall.returnValue, expected, 'Message is correct');
		startRepl.restore();
		replWelcomeMessage.restore();
	});

	it('should set default parameters', async() => {
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);

		await startREPL();
		const args = startRepl.firstCall.args[0];

		assert.strictEqual(args.cwd, __dirname, 'CWD set');
		assert.ok(args.vars.suitest, 'Suitest var set');
		assert.deepStrictEqual(args.watch, [path.join(__dirname, '**/*.js')], 'Watch folder set');
		assert.ok(!args.repeater, 'Repeater not present');

		startRepl.restore();
	});

	it('should accept repl user options', async() => {
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);

		const fakeVar = {a: 1};
		const repeater = a => a;

		await startREPL({
			watch: 'bububu',
			vars: {fakeVar},
			repeater,
		});

		const args = startRepl.firstCall.args[0];

		assert.strictEqual(args.cwd, __dirname, 'CWD set correctly');
		assert.deepStrictEqual(args.vars.fakeVar, fakeVar, 'User var set correctly');
		assert.deepStrictEqual(args.watch, ['bububu'], 'Watch parameter set correctly');
		assert.strictEqual(args.repeater, repeater, 'Repeater set correctly');

		startRepl.restore();
	});
});
