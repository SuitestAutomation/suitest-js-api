const assert = require('assert');
const {getOwnArgs, hideOwnArgs} = require('../../lib/testLauncher/processArgs');

let argv = [];

before(async() => {
	argv = process.argv;
});

after(async() => {
	process.argv = argv;
});

describe('process-args', () => {
	it('hideOwnArgs', () => {
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--k',
			'key',
			'--p',
			'password',
			'npm',
			'test',
			'-s',
			'some arg',
		];

		assert.deepEqual(hideOwnArgs(), ['npm', 'test', '-s', 'some arg'], 'hidden lib arguments');
	});

	it('hideOwnArgs should unshift execPath', () => {
		process.execPath = 'testPath';
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--k',
			'key',
			'./testDir',
			'-s',
			'some arg',
		];

		assert.deepEqual(
			hideOwnArgs(),
			['testPath', './testDir', '-s', 'some arg'],
			'hidden lib arguments',
		);
	});

	it('hideOwnArgs without additional arguments', () => {
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--k',
			'key',
			'--p',
			'password',
		];

		assert.deepEqual(hideOwnArgs(), [], 'hidden lib arguments');
	});

	it('hideOwnArgs without additional arguments', () => {
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--k',
			'key',
			'--p',
			'password',
		];

		assert.deepEqual(
			getOwnArgs(),
			['automated', '--k', 'key', '--p', 'password'],
			'hidden lib arguments',
		);
	});

	it('hideOwnArgs with additional arguments', () => {
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--k',
			'key',
			'--p',
			'password',
			'npm',
			'test',
			'-s',
			'some arg',
		];

		assert.deepEqual(
			getOwnArgs(),
			['automated', '--k', 'key', '--p', 'password'],
			'hidden lib arguments',
		);
	});
});
