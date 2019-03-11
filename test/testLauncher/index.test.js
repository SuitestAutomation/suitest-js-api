const path = require('path');
const assert = require('assert');
const {authContext} = require('../../lib/context');

const testLauncherTest = processExecPath(path.resolve(__dirname, '../../lib/utils/testHelpers/testLauncherTest.js'));
const spawn = require('child_process').spawn;

function processExecPath(execPath) {
	return /\s+/.test(execPath) ? `"${execPath}"` : execPath;
}

describe('suitest test launcher', function() {
	this.timeout(5000); // increase timeout limit for current test suite

	beforeEach(async() => {
		authContext.clear();
	});

	after(async() => {
		authContext.clear();
	});

	it('"automated" command should exit with exitCode 0', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'automated', '-p', 'a', '-k', 'a', '--testPackId', '10', 'npm', '--version'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"automated" command should exit with exitCode 1 if required args not provided', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'automated'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 1, 'should exit without error');
			done();
		});
	});

	it('"automated" command should exit with exitCode 0 if --version option provided', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'automated', '--version'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"automated" command should exit with exitCode 1 if no devices in response', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'automated', '-p', 'a', '-k', 'a', '--testPackId', '20', 'npm', '--version'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 1, 'should exit without error');
			done();
		});
	});

	it('"interactive" command should exit with exitCode 0', (done) => {
		spawn(
			processExecPath(process.execPath),
			[
				testLauncherTest, 'interactive', '-u', 'userEmail', '-p', 'userPass',
				'-o', 'orgId', '-c', 'configId', '-d', 'deviceId', 'npm', '--version',
			],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"interactive" command should exit with exitCode 1 if required args not provided', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'interactive', '-p', 'pass'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 1, 'should exit without error');
			done();
		});
	});

	it('"interactive" command should exit with exitCode 0 if calle with --help option', (done) => {
		spawn(
			processExecPath(process.execPath),
			[testLauncherTest, 'interactive', '-h'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'start should exit without error');
			done();
		});
	});
});
