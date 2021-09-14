const path = require('path');
const assert = require('assert');
const {authContext} = require('../../index');

const testLauncherTest = processExecPath(path.resolve(__dirname, '../../lib/utils/testHelpers/testLauncherTest.js'));
const spawn = require('child_process').spawn;

function processExecPath(execPath) {
	return /\s+/.test(execPath) ? `"${execPath}"` : execPath;
}

// TODO: add tests for covering validation for configs with presets and without(using deviceId and appConfigId)
describe('suitest test launcher', function() {
	this.timeout(5000); // increase timeout limit for current test suite

	beforeEach(async() => {
		authContext.clear();
	});

	after(async() => {
		authContext.clear();
	});

	it('"run" command should exit with exitCode 0', (done) => {
		spawn(
			processExecPath(process.execPath),
			[
				testLauncherTest, 'run', '--token-id', 'id', '--token-password', 'password',
				'--device-id', 'deviceid', '--app-config-id', 'configid', 'npm', 'version',
			],
			{shell: true},
		).once('exit', (exitCode) => {
			assert.strictEqual(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"run" command should exit with exitCode 1 if required args not provided', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'run'],
			{shell: true},
		).once('exit', (exitCode) => {
			assert.strictEqual(exitCode, 1, 'should exit without error');
			done();
		});
	});

	it('"run" command should exit with exitCode 0 if --version option provided', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'run', '--version'],
			{shell: true},
		).once('exit', (exitCode) => {
			assert.strictEqual(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"run" command should exit with exitCode 0 if calle with --help option', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'run', '-h'],
			{shell: true},
		).once('exit', (exitCode) => {
			assert.strictEqual(exitCode, 0, 'start should exit without error');
			done();
		});
	});
});
