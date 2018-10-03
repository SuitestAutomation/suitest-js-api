const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const Promise = require('bluebird');

const logger = require('../../lib/utils/logger');
const interactive = require('../../lib/commands/interactive');
const repl = require('../../lib/testLauncher/repl');
const texts = require('../../lib/texts');
const {authContext} = require('../../lib/context');

const stubbed = {};

describe('interactive command', () => {
	before(() => {
		process.env.REPL_IPC_PORT = 'fake';
	});

	beforeEach(() => {
		sinon.stub(logger);
		stubbed.authContext = sinon.stub(authContext, 'isInteractiveSession').returns(true);
	});
	afterEach(() => {
		sinon.restore();
		stubbed.authContext.restore();
	});
	it('should not start another repl instance if one is already running', async() => {
		const replSessionEnded = sinon.stub(texts, 'replSessionEnded');

		let startRepl;
		let replCalls = 0;

		return new Promise(async resolve => {
			startRepl = sinon.stub(repl, 'startRepl').callsFake(async() => {
				await interactive();
				++replCalls;
				assert.equal(replCalls, 1, 'Second call is ignored');
				resolve();
			});
			await interactive();
		}).then(async() => {
			startRepl.restore();
			startRepl = sinon.stub(repl, 'startRepl').returns(Promise.resolve());

			await interactive();
			assert.equal(replSessionEnded.callCount, 2, 'Repl went through exactly 2x although 3 attempts where made');
		}).then(() => {
			startRepl.restore();
			replSessionEnded.restore();
		});
	});

	it('should not give warning in interactive mode and give warning in automated mode', async() => {
		const replWarnInteractive = sinon.stub(texts, 'replWarnInteractive');
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);

		await interactive();
		assert.ok(!replWarnInteractive.called, 'Warning not displayed in interactive mode');
		stubbed.authContext.restore();
		stubbed.authContext = sinon.stub(authContext, 'isInteractiveSession').returns(false);
		await interactive();
		assert.ok(replWarnInteractive.called, 'Warning displayed in automated mode');

		startRepl.restore();
		replWarnInteractive.restore();
	});

	it('should print the welcome message describing all launch settings', async() => {
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);
		const replWelcomeMessage = sinon.spy(texts, 'replWelcomeMessage');

		// eslint-disable-next-line max-len
		const expected = 'Test execution has been paused for the interactive session\nNow you can:\n\n  1. Edit watched files - Suitest will reload them and execute the repeater\n     function every time they change on disk.\n  2. Use the prompt below to execute any JavaScript in real time.\n\nHere is your environment:\n\n  Current working dir: \u001b[37m' + __dirname + '\u001b[39m\n  Repeater function: \u001b[37mnone\u001b[39m\n  Available local variables: \u001b[37msuitest\u001b[39m\n  Watched files (relative to your working dir):\n    - \u001b[37m'+ path.join(__dirname, '\\**\\*.js') + '\u001b[39m\n\n';

		await interactive();

		assert.equal(replWelcomeMessage.firstCall.returnValue, expected, 'Message is correct');
		startRepl.restore();
		replWelcomeMessage.restore();
	});

	it('should set default parameters', async() => {
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);

		await interactive();
		const args = startRepl.firstCall.args[0];

		assert.equal(args.cwd, __dirname, 'CWD set');
		assert.ok(args.vars.suitest, 'Suitest var set');
		assert.equal(args.watch, path.join(__dirname, '**/*.js'), 'Watch folder set');
		assert.ok(!args.repeater, 'Repeater not present');

		startRepl.restore();
	});

	it('should accept repl user options', async() => {
		const startRepl = sinon.stub(repl, 'startRepl').resolves(1);

		const fakeVar = {a: 1};
		const repeater = a => a;

		await interactive({
			watch: 'bububu',
			vars: {fakeVar},
			repeater,
		});

		const args = startRepl.firstCall.args[0];

		assert.equal(args.cwd, __dirname, 'CWD set correctly');
		assert.deepEqual(args.vars.fakeVar, fakeVar, 'User var set correctly');
		assert.equal(args.watch, 'bububu', 'Watch parameter set correctly');
		assert.equal(args.repeater, repeater, 'Repeater set correctly');

		startRepl.restore();
	});
});
