const assert = require('assert');

const {format} = require('../../lib/utils/timestamp');
const timestampOff = require('../../lib/constants/timestamp').none;

describe('timestamp util', () => {
	it('should format date correctly', async() => {
		const date = new Date('December 17, 1995');

		assert.strictEqual(format('MMMM DD, YYYY', date), 'December 17, 1995', 'correct format 1');
		assert.strictEqual(format('YYYY MM DD', date), '1995 12 17', 'correct format 2');
		assert.strictEqual(format(timestampOff, date), '', 'no timestamp');
	});
});

