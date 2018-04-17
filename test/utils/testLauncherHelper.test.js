const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;

const SuitestError = require('../../lib/utils/SuitestError');
const {launcherLogger} = require('../../lib/testLauncher/launcherLogger');
const testLauncherHelper = require('../../lib/utils/testLauncherHelper');

describe('testLauncherHelper util', () => {
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
		// add test rc file
		fs.writeFileSync(path.resolve(process.cwd(), '.suitestrc'), '{"test": "test"}');
		assert.deepEqual(testLauncherHelper.readLauncherConfig(), {test: 'test'}, 'correct rc');
		// remove test rc file
		fs.unlinkSync(path.resolve(process.cwd(), '.suitestrc'));

		// add test js file
		fs.writeFileSync(path.resolve(process.cwd(), 'suitestrc.js'), 'module.exports = {test: \'test\'};');
		assert.deepEqual(testLauncherHelper.readLauncherConfig(), {test: 'test'}, 'correct js');
		// remove test js file
		fs.unlinkSync(path.resolve(process.cwd(), 'suitestrc.js'));
	});

	it('should throw error in case of invalid rc json', () => {
		// add test rc file
		fs.writeFileSync(path.resolve(process.cwd(), '.suitestrc'), 'invalid something');
		assert.throws(() => testLauncherHelper.readLauncherConfig(), /Error/);
		// remove test rc file
		fs.unlinkSync(path.resolve(process.cwd(), '.suitestrc'));
	});

	it('should merge two configs correctly', () => {
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: false}, {}), {a: false});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: false}, {a: undefined}), {a: false});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: false}, {a: null}), {a: false});
		assert.deepStrictEqual(testLauncherHelper.mergeConfigs({a: undefined}, {a: null}), {a: null});
	});

	it('should read from child process stdout and stderr correctly', done => {
		const childSpy = sinon.spy(l => {
			if (l === 'testError') {
				done();
			}
		});
		const child = spawn('node', ['--version'], {shell: true});

		testLauncherHelper.followChildProccess(child, childSpy);

		child.stdout.on('data', () => {
			assert.strictEqual(childSpy.called, true);
			child.stderr.push('testError');
		});

		child.stderr.on('data', err => {
			assert.strictEqual(err.toString(), 'testError');
		});
	});
});
