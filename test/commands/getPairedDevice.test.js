const assert = require('assert');
const suitest = require('../../index');

const obj = {};

describe('getPairedDevice', () => {
	afterEach(() => {
		suitest.pairedDeviceContext.clear();
	});

	it('should have getPairedDevice', () => {
		assert.strictEqual(typeof suitest.getPairedDevice, 'function');
	});

	it('should return context value', () => {
		suitest.pairedDeviceContext.clear();
		assert.strictEqual(suitest.getPairedDevice(), null);
		suitest.pairedDeviceContext.setContext(obj);
		assert.strictEqual(suitest.getPairedDevice(), obj);
	});
});
