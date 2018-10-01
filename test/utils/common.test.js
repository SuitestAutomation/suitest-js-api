const assert = require('assert');
const {pickNonNil} = require('../../lib/utils/common');

describe('common utils', () => {
	it('should test pickNonNil', () => {
		assert.deepEqual(
			pickNonNil(['a', 'b', 'c', 'd'], {
				a: undefined,
				b: null,
				c: true,
				d: false,
			}),
			{
				c: true,
				d: false,
			},
			'pick correct fields',
		);
	});
});
