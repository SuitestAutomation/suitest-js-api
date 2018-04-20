const path = require('path');
const assert = require('assert');
const nock = require('nock');
const {authContext} = require('../../lib/context');
const testServer = require('../../lib/utils/testServer');
const texts = require('../../lib/texts');

const testLauncherTest = path.resolve(__dirname, '../../lib/utils/testHelpers/testLauncherTest.js');
const spawn = require('child_process').spawn;

describe('suitest test launcher', function() {
	this.timeout(5000); // increase timeout limit for current test suite

	before(async() => {
		await testServer.start();
	});

	beforeEach(async() => {
		await testServer.restart();
		authContext.clear();
	});

	after(async() => {
		nock.cleanAll();
		authContext.clear();
		await testServer.stop();
	});

	it('"automated" command should exit with exitCode 0', (done) => {
		spawn(
			process.execPath,
			[testLauncherTest, 'automated', '-p', 'a', '-k', 'a', '--testPackId', '10', 'npm', '--version'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"automated" command should exit with exitCode 1 if required args not provided', (done) => {
		spawn(
			process.execPath,
			[testLauncherTest, 'automated'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 1, 'should exit without error');
			done();
		});
	});

	it('"automated" command should exit with exitCode 0 if --version option provided', (done) => {
		spawn(
			process.execPath,
			[testLauncherTest, 'automated', '--version'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"automated" command should exit with exitCode 1 if no devices in response', (done) => {
		spawn(
			process.execPath,
			[testLauncherTest, 'automated', '-p', 'a', '-k', 'a', '--testPackId', '20', 'npm', '--version'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 1, 'should exit without error');
			done();
		});
	});

	it('"interactive" command should exit with exitCode 0', (done) => {
		spawn(
			process.execPath,
			[
				testLauncherTest, 'interactive', '-u', 'userEmail', '-p', 'userPass',
				'-o', 'orgId', '-C', 'configId', '-d', 'deviceId', 'npm', '--version',
			],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'should exit without error');
			done();
		});
	});

	it('"interactive" command should exit with exitCode 1 if required args not provided', (done) => {
		spawn(
			process.execPath,
			[testLauncherTest, 'interactive', '-p', 'pass'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 1, 'should exit without error');
			done();
		});
	});

	it('"interactive" command should ask for user password if not provided', (done) => {
		let passProvided = false;
		const child = spawn(
			process.execPath,
			[testLauncherTest, 'interactive'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 1, 'should exit without error');
			done();
		});

		child.stdout.on('data', (data) => {
			if (!passProvided) {
				assert.strictEqual(`${data}`, texts['tl.promptPassword'](), 'password asked');
				// send myPassword to child task
				child.stdin.setEncoding('utf-8');
				child.stdin.write('myPassword');
				child.stdin.write('\r\n');
				passProvided = true;
			}
		});
	});

	it('"interactive" command should ask for user password if not provided', (done) => {
		let propmptCount = 0;
		let passProvided = false;

		const child = spawn(
			process.execPath,
			[testLauncherTest, 'interactive'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.strictEqual(exitCode, 1, 'should exit with error');
			assert.strictEqual(propmptCount, 3, 'should ask three times');
			done();
		});

		child.stdout.on('data', (data) => {
			if (!passProvided) {
				assert.strictEqual(`${data}`, texts['tl.promptPassword'](), 'password asked');
				// send myPassword to child task
				child.stdin.setEncoding('utf-8');
				if (propmptCount === 2) {
					child.stdin.write('myPassword');
					passProvided = true;
				}
				child.stdin.write('\r\n');
				propmptCount++;
			}
		});
	});

	it('"interactive" command should ask for user password end exit with 0 if terminated by user', (done) => {
		let propmptCount = 0;
		let passProvided = false;

		const child = spawn(
			process.execPath,
			[testLauncherTest, 'interactive'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.strictEqual(exitCode, 0, 'should exit without error');
			assert.strictEqual(propmptCount, 1, 'should ask once');
			done();
		});

		child.stdout.on('data', (data) => {
			if (!passProvided) {
				assert.strictEqual(`${data}`, texts['tl.promptPassword'](), 'password asked');
				propmptCount++;
				passProvided = true;
				// end stdin without input
				child.stdin.end();
			}
		});
	});

	it('"interactive" command should exit with exitCode 0 if calle with --help option', (done) => {
		spawn(
			process.execPath,
			[testLauncherTest, 'interactive', '-h'],
			{shell: true}
		).once('exit', (exitCode) => {
			assert.equal(exitCode, 0, 'start should exit without error');
			done();
		});
	});
});
