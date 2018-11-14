const assert = require('assert');

const {format} = require('../../lib/utils/timestamp');
const {config, override} = require('../../config');
const timestampOff = require('../../lib/constants/timestamp').none;

const cachedConfig = {...config};

describe('timestamp util', () => {
	after(() => {
		override(cachedConfig);
	});

	it('should format date correctly', async() => {
		override({timestamp: 'MMMM DD, YYYY'});
		assert.strictEqual(format(new Date('December 17, 1995')), 'December 17, 1995');
		override({timestamp: 'YYYY MM DD'});
		assert.strictEqual(format(new Date('December 17, 1995')), '1995 12 17');
		override({timestamp: timestampOff});
		assert.strictEqual(format(new Date('December 17, 1995')), '');
	});
});
