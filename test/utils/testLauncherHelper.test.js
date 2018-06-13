const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const validation = require('../../lib/validataion');

const SuitestError = require('../../lib/utils/SuitestError');
const {snippets: log, launcherLogger} = require('../../lib/testLauncher/launcherLogger');
const testLauncherHelper = require('../../lib/utils/testLauncherHelper');
const launcherLoggerHelper = require('../../lib/utils/launcherLoggerHelper');

describe('testLauncherHelper util', () => {
	const rcFilePath = path.resolve(process.cwd(), '.suitestrc');

	beforeEach(() => {
		sinon.stub(process, 'exit');
		sinon.stub(launcherLogger, '_err');
	});

	afterEach(() => {
		process.exit.restore();
		launcherLogger._err.restore();
	});

	it('should handle launcher error', () => {
		const err = new Error();

		testLauncherHelper.handleLauncherError(err);
		assert(process.exit.calledWith(1));
		assert(launcherLogger._err.called);
	});

	it('should handle launcher SuitestError', () => {
		const err = new SuitestError();

		testLauncherHelper.handleLauncherError(err);
		assert(process.exit.calledWith(1));
		assert(launcherLogger._err.called);
	});

	it('should handle launcher child successful result', () => {
		testLauncherHelper.handleChildResult(true);
		assert(process.exit.calledWith(1));
	});

	it('should handle launcher child result without errors', () => {
		testLauncherHelper.handleChildResult(false);
		assert(process.exit.calledWith(0));
	});

	it('should return empty object if config file not found', () => {
		assert.deepEqual(testLauncherHelper.readLauncherConfig(), {}, 'empty object');
	});

	it('should find and read rc file', () => {
		fs.writeFileSync(rcFilePath, '{"test": "test"}');

		const config = testLauncherHelper.readLauncherConfig();

		assert.deepEqual(config, {
			test: 'test',
			configs: [rcFilePath],
			config: rcFilePath,
		}, 'correct json');
		assert.strictEqual('_' in config, false, 'cli arges not included');

		fs.writeFileSync(rcFilePath, 'test = test');
		assert.strictEqual(testLauncherHelper.readLauncherConfig().test, 'test', 'correct ini');

		// remove test file
		fs.unlinkSync(rcFilePath);
	});

	it('should throw error in case of invalid rc json', () => {
		// add test rc file
		fs.writeFileSync(rcFilePath, '{invalid: undefined}');
		assert.throws(() => testLauncherHelper.readLauncherConfig(), /Error/);
		// remove test rc file
		fs.unlinkSync(rcFilePath);
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

	it('should writeLogs create dir and stream correctly', () => {
		const createWriteStream = sinon.stub(launcherLoggerHelper, 'createWriteStream').callsFake((path, id) => {
			if (id === '2') {
				throw new SuitestError('err');
			} else if (id === '3') {
				throw new Error('err');
			}
		});
		const mkDirByPathSync = sinon.stub(launcherLoggerHelper, 'mkDirByPathSync');
		const _ = sinon.stub(launcherLogger, '_');

		testLauncherHelper.writeLogs('1', ['a', 'red'], './fake/path');

		assert.deepEqual(createWriteStream.firstCall.args, ['./fake/path', '1', undefined], 'createWriteStream called with right args');
		assert.equal(mkDirByPathSync.firstCall.args[0], './fake/path', 'mkDirByPathSync called with right args');
		assert.ok(_.called, 'log called');

		testLauncherHelper.writeLogs('2', ['a', 'red'], './fake/path');
		assert.ok(process.exit.calledWith(1), 'proccess exit called with 1');

		testLauncherHelper.writeLogs('3', ['a', 'red'], './fake/path');
		assert.ok(process.exit.calledWith(1), 'proccess exit called with 1');
		assert.equal(launcherLogger._err.secondCall.args[1], '3', '_err called with right deviceId');
		_.restore();

		createWriteStream.restore();
		mkDirByPathSync.restore();
	});
});
