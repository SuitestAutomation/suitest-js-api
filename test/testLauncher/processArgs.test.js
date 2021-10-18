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
			'run',
			'--k',
			'key',
			'--p',
			'password',
			'npm',
			'test',
			'-s',
			'some arg',
		];

		assert.deepStrictEqual(hideOwnArgs(), ['npm', 'test', '-s', 'some arg'], 'hidden lib arguments');
	});

	it('hideOwnArgs should not unshift execPath', () => {
		process.execPath = 'testPath';
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'run',
			'--k',
			'key',
			'./testDir',
			'-s',
			'some arg',
		];

		assert.deepStrictEqual(
			hideOwnArgs(),
			['./testDir', '-s', 'some arg'],
			'hidden lib arguments',
		);
	});

	it('hideOwnArgs without additional arguments', () => {
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'run',
			'--k',
			'key',
			'--p',
			'password',
		];

		assert.deepStrictEqual(hideOwnArgs(), [], 'hidden lib arguments');
	});

	it('hideOwnArgs without additional arguments', () => {
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'run',
			'--k',
			'key',
			'--p',
			'password',
		];

		assert.deepStrictEqual(
			getOwnArgs(),
			['run', '--k', 'key', '--p', 'password'],
			'hidden lib arguments',
		);
	});

	it('hideOwnArgs with additional arguments', () => {
		process.argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'run',
			'--k',
			'key',
			'--p',
			'password',
			'npm',
			'test',
			'-s',
			'some arg',
		];

		assert.deepStrictEqual(
			getOwnArgs(),
			['run', '--k', 'key', '--p', 'password'],
			'hidden lib arguments',
		);
	});

	it('parseOptions when inspect is Boolean', () => {
		const argv = [
			'/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'run',
			'--inspect=true',
		];

		assert.deepStrictEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'run',
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
			'run',
			'--inspect=9099',
		];

		assert.deepStrictEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'run',
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
			'run',
			'--inspect',
			'node',
		];

		assert.deepStrictEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'run',
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
			'run',
			'--inspect-brk',
			'node',
		];

		assert.deepStrictEqual(
			parseOptions(argv),
			{
				_: [
					'/Users/aaa/bin/iojs',
					'/Users/aaa/bin/suitest.js',
					'run',
					'node',
				],
				inspectBrk: true,
				'inspect-brk': true,
			},
			'inspect-brk is true when no value provided',
		);
	});
});
