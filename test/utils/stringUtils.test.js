const assert = require('assert');
const {EOL} = require('os');
const colors = require('colors');
const {
	arrToString,
	stripAnsiChars,
} = require('../../lib/utils/stringUtils');

describe('stringUtils util', () => {
	it('test arrToString', () => {
		assert.equal(arrToString(['hello', 'world']), `${EOL}\thello${EOL}\tworld`, 'default');
		assert.equal(arrToString(['hello']), 'hello', 'single item');
		assert.equal(arrToString(['hello'], true), `${EOL}\thello`, 'single item new line');
	});

	it('test stripAnsiChars', () => {
		assert.equal(stripAnsiChars(colors.red('test')), 'test');
		assert.equal(stripAnsiChars(colors.green('test')), 'test');
	});
});
