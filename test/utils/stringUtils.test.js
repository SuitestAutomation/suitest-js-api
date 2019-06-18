const assert = require('assert');
const {EOL} = require('os');
const colors = require('colors');
const {
	arrToString,
	stripAnsiChars,
	appendDot,
	placeholdEmpty,
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

	it('placeholdEmpty should transform empty strings properly', () => {
		assert.equal(placeholdEmpty(''), '[EMPTY]');
		assert.equal(placeholdEmpty(' '), ' ');
		assert.equal(placeholdEmpty(1), 1);
	});
});
