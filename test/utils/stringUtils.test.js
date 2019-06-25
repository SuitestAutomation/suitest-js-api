const assert = require('assert');
const {EOL} = require('os');
const colors = require('colors');
const {
	arrToString,
	stripAnsiChars,
	appendDot,
	placeholdEmpty,
	truncate,
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

	it('should truncate strings correctly', () => {
		assert.strictEqual(truncate('12345', 5), '12345');
		assert.strictEqual(truncate('123456', 5), '1234…');
		assert.strictEqual(truncate('123   ', 5), '123…');
		assert.strictEqual(truncate('123.  ', 5), '123…');
	});
});
