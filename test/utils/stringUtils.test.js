const assert = require('assert');
const {EOL} = require('os');
const {arrToString} = require('../../lib/utils/stringUtils');

describe('stringUtils util', () => {
	it('test arrToString', () => {
		assert.equal(arrToString(['hello', 'world']), `${EOL}\thello${EOL}\tworld`, 'default');
		assert.equal(arrToString(['hello']), 'hello', 'single item');
		assert.equal(arrToString(['hello'], true), `${EOL}\thello`, 'single item new line');
	});
});
