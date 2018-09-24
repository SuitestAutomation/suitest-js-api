const assert = require('assert');
const sinon = require('sinon');
const spawn = require('child_process').spawn;
const validation = require('../../lib/validataion');

const SuitestError = require('../../lib/utils/SuitestError');
const {snippets: log} = require('../../lib/testLauncher/launcherLogger');
const launcherLogger = require('../../lib/utils/logger');
const launcherLoggerHelper = require('../../lib/utils/launcherLoggerHelper');
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

	it('should merge two configs correctly', () => {
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: false}, {}), {a: false});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: false}, {a: undefined}), {a: false});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: false}, {a: null}), {a: false});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: undefined}, {a: null}), {a: undefined});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: undefined}, {a: false}), {a: false});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: true}, {a: false}), {a: false});
	});

	it('should read from child process stdout and stderr correctly', done => {
		const childSpy = sinon.spy(l => {
			if (l === 'testError') {
				done();
			}
		});
		const child = spawn('node', ['--version'], {shell: true});

		testLauncherHelper.followChildProcess(child, childSpy);

		child.stdout.on('data', () => {
			assert.strictEqual(childSpy.called, true);
			child.stderr.push('testError');
		});

		child.stderr.on('data', err => {
			assert.strictEqual(err.toString(), 'testError');
		});
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

	//todo this is not much of a test
	it('should writeLogs create dir and stream correctly', () => {
		const mkDirByPathSync = sinon.stub(launcherLoggerHelper, 'mkDirByPathSync');

		const deviceMeta = {
			displayName: 'displayName',
			shortName: 'shortName',
			manufacturer: 'manufacturer',
			model: 'model',
		};

		testLauncherHelper.writeLogs(
			{
				deviceId: '1',
				...deviceMeta,
			},
			['a', 'red'],
			new Date(),
			'./fake/path',
			'automated'
		);

		assert.equal(mkDirByPathSync.args[0], './fake/path', 'mkDirByPathSync called with right args');
		mkDirByPathSync.restore();
	});
});
