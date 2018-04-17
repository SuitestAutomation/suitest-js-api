const assert = require('assert');
const {API_CONSTRUCTOR_NAME} = require('../../lib/constants');
const isSuitestMethod = require('../../lib/utils/isSuitestMethod');

describe('isSuitestMethod util', () => {
	it('should check if method belongs of SUITEST_API class', () => {
		assert.strictEqual(isSuitestMethod('someFunction'), false);
		assert.strictEqual(isSuitestMethod('SUITEST'), false);
		assert.strictEqual(isSuitestMethod(API_CONSTRUCTOR_NAME), true);
		assert.strictEqual(isSuitestMethod(API_CONSTRUCTOR_NAME + '.'), true);
		assert.strictEqual(isSuitestMethod('123' + API_CONSTRUCTOR_NAME + '456'), true);
	});
});
