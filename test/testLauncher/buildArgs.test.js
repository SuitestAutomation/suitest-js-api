const assert = require('assert');
const {buildYargs, addCommandsAndHelp} = require('../../lib/testLauncher/buildArgs');
const yargs = require('yargs/yargs');

describe('test launcher config utils', () => {
	it('config utils buildYargs', async() => {
		assert.equal(typeof buildYargs, 'function', 'buildYargs exist and is a function');
		process.argv = ['/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'--token-key',
			'key',
			'--p',
			'password',
			'npm',
			'test',
			'-s',
			'some arg',
		];

		assert.equal(buildYargs().getOptions().key.help, undefined, 'buildYargs should not containg help');
		assert.equal(buildYargs().getOptions().key.h, undefined, 'buildYargs should not containg help');
		assert.equal(
			buildYargs().getOptions().key.version,
			undefined,
			'buildYargs should not containg version'
		);
	});

	it('config utils addCommandsAndHelp', async() => {
		assert.equal(typeof addCommandsAndHelp, 'function', 'addCommandsAndHelp exist and is a function');
		process.argv = ['/Users/aaa/bin/iojs',
			'/Users/aaa/bin/suitest.js',
			'--token-key',
			'key',
			'--p',
			'password',
			'npm',
			'test',
			'-s',
			'some arg',
		];

		assert.equal(
			addCommandsAndHelp(yargs([])).getOptions().key.help,
			true,
			'addCommandsAndHelp should containg help'
		);
		assert.equal(
			addCommandsAndHelp(yargs([])).getOptions().key.version,
			true,
			'addCommandsAndHelp should containg version'
		);
	});
});
