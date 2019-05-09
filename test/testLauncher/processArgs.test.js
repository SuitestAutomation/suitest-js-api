const assert = require('assert');
const {getOwnArgs, hideOwnArgs, parseOptions} = require('../../lib/testLauncher/processArgs');

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

	it('hideOwnArgs should not unshift execPath', () => {
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
			['./testDir', '-s', 'some arg'],
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

	it('parseOptions when inspect is Boolean', () => {
		const argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--inspect=true',
		];

		assert.deepEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'automated',
				],
				inspect: true,
			},
			'inspect is boolean',
		);
	});

	it('parseOptions when inspect is Number', () => {
		const argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--inspect=9099',
		];

		assert.deepEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'automated',
				],
				inspect: 9099,
			},
			'inspect is number',
		);
	});

	it('parseOptions when inspect used without value', () => {
		const argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--inspect',
			'node',
		];

		assert.deepEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'automated',
					'node',
				],
				inspect: true,
			},
			'inspect is true when no value provided',
		);
	});

	it('parseOptions when inspect-brk used without value', () => {
		const argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'automated',
			'--inspect-brk',
			'node',
		];

		assert.deepEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'automated',
					'node',
				],
				inspectBrk: true,
				'inspect-brk': true,
			},
			'inspect-brk is true when no value provided',
		);
	});
});
