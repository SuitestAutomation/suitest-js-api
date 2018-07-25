const assert = require('assert');
const {EOL} = require('os');
const colors = require('colors');
const {
	arrToString,
	stripAnsiChars,
	appendDot,
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

	it('test appendDot', () => {
		assert.equal(appendDot(''), '.');
		assert.equal(appendDot('test'), 'test.');
		assert.equal(appendDot('test.'), 'test.');
	});
});
