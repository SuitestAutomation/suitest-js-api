const assert = require('assert');
const sinon = require('sinon');
const validation = require('../../lib/validataion');
const EventEmitter = require('events');

const SuitestError = require('../../lib/utils/SuitestError');
const {snippets: log} = require('../../lib/testLauncher/launcherLogger');
const launcherLogger = require('../../lib/utils/logger');
const testLauncherHelper = require('../../lib/utils/testLauncherHelper');

describe('testLauncherHelper util', () => {
	beforeEach(() => {
		sinon.stub(process, 'exit');
		sinon.stub(console, 'error');
		sinon.stub(launcherLogger, 'error');
	});

	afterEach(() => {
		process.exit.restore();
		console.error.restore();
		launcherLogger.error.restore();
	});

	it('should handle launcher error', () => {
		const err = new Error();

		testLauncherHelper.handleLauncherError(err);
		assert(process.exit.calledWith(1));
		assert(launcherLogger.error.called);
	});

	it('should handle launcher SuitestError', () => {
		const err = new SuitestError();

		testLauncherHelper.handleLauncherError(err);
		assert(process.exit.calledWith(1));
		assert(launcherLogger.error.called);
	});

	it('should handle launcher child successful result', () => {
		testLauncherHelper.handleChildResult(true);
		assert(process.exit.calledWith(1));
	});

	it('should handle launcher child result without errors', () => {
		testLauncherHelper.handleChildResult(false);
		assert(process.exit.calledWith(0));
	});

	it('should validateInput correctly', () => {
		const validate = sinon.stub(validation, 'validate');
		const argsValidationError = sinon.stub(log, 'argsValidationError');

		testLauncherHelper.validateInput('AUTOMATED', {});
		assert.equal(validation.validate.firstCall.args[0], validation.validators.TEST_LAUNCHER_AUTOMATED);
		assert.deepEqual(validation.validate.firstCall.args[1], {});
		assert.equal(validation.validate.firstCall.args[2], 'provided for \'suitest automated\' command. It');
		assert.ok(!process.exit.called, 'exit not called');
		validate.restore();
		testLauncherHelper.validateInput('AUTOMATED', {});
		assert.ok(argsValidationError.firstCall.args[0].message.includes('Invalid input'));
		assert.ok(process.exit.calledWith(1), 'exit called with 1');
		argsValidationError.restore();
	});

	it('should increaseMaxListeners correctly', () => {
		const emitter1 = new EventEmitter();
		const listenersCount1 = emitter1.getMaxListeners();

		testLauncherHelper.increaseMaxListeners(emitter1, 5, 3);

		assert.strictEqual(emitter1.getMaxListeners(), listenersCount1 + 6, 'when devicesCount > concurrency allowed, limit to concurrency');

		const emitter2 = new EventEmitter();
		const listenersCount2 = emitter2.getMaxListeners();

		testLauncherHelper.increaseMaxListeners(emitter2, 5, 0);

		assert.strictEqual(emitter2.getMaxListeners(), listenersCount2 + 10, 'when concurrency is 0, limit to devicesCount');

		const emitter3 = new EventEmitter();
		const listenersCount3 = emitter3.getMaxListeners();

		testLauncherHelper.increaseMaxListeners(emitter3, 5, 10);

		assert.strictEqual(emitter3.getMaxListeners(), listenersCount3 + 10, 'when devicesCount < concurrency, limit to devicesCount');
	});
});
