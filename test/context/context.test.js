const assert = require('assert');
const context = require('../../lib/context');
const Context = require('../../lib/utils/Context');

describe('context', () => {
	it('should export initialized contexts', () => {
		assert.ok('authContext' in context);
		assert.ok('testContext' in context);
		assert.ok('pairedDeviceContext' in context);
		assert.ok('appContext' in context);
	});
	it('exported values should be instance of Context', () => {
		assert.ok(context.authContext instanceof Context);
		assert.ok(context.testContext instanceof Context);
		assert.ok(context.pairedDeviceContext instanceof Context);
		assert.ok(context.appContext instanceof Context);
	});
});
