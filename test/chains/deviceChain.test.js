const assert = require('assert');
const suitest = require('../../index');
const {
	device,
	toJSON,
} = require('../../lib/chains/deviceChain')(suitest);

function testAllowedModifiers(chain) {
	// general
	assert.strictEqual(typeof chain.clone, 'function');
	assert.strictEqual(typeof chain.abandon, 'function');
	assert.strictEqual(typeof chain.toString, 'function');
	assert.strictEqual(typeof chain.toJSON, 'function');
	assert.strictEqual(typeof chain.then, 'function');
	assert.strictEqual(typeof chain.setOrientation, 'function');
}

/**
 * This test is sort of high level, more like integration test
 * however it's compliant to BDD principles because of this.
 * We don't care about implementation details, we need code to do what we want
 */
describe('Device chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = device();

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.toJSON, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.repeat, 'undefined');
		assert.strictEqual(typeof chain.interval, 'undefined');
		assert.strictEqual(typeof chain.setOrientation, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after sendText is applied', () => {
		function testDeviceOrientationModifier(chain) {
			assert.strictEqual(typeof chain.clone, 'function');
			assert.strictEqual(typeof chain.abandon, 'function');
			assert.strictEqual(typeof chain.toString, 'function');
			assert.strictEqual(typeof chain.toJSON, 'function');
			assert.strictEqual(typeof chain.then, 'function');
			assert.strictEqual(typeof chain.repeat, 'function');
			assert.strictEqual(typeof chain.interval, 'function');
			assert.strictEqual(typeof chain.sendText, 'undefined');
			assert.strictEqual(typeof chain.refresh, 'undefined');
			assert.strictEqual(typeof chain.goBack, 'undefined');
			assert.strictEqual(typeof chain.goForward, 'undefined');
			assert.strictEqual(typeof chain.setSize, 'undefined');
			assert.strictEqual(typeof chain.dismissModal, 'undefined');
			assert.strictEqual(typeof chain.acceptModal, 'undefined');
		}

		it('with empty string as a value', () => {
			testDeviceOrientationModifier(device().setOrientation('landscape'));
		});
	});

	it('should have only allowed modifiers after other modifiers are applied', () => {
		testAllowedModifiers(device());
	});

	it('should have only allowed modifiers after abandon is applied', () => {
		const chain = device().abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({}), {
			type: 'eval',
			request: {
				type: 'deviceSettings',
				deviceSettings: {
					params: {
						orientation: undefined,
					},
					type: 'setOrientation',
				},
			},
		}, 'type testLine device');
		assert.deepStrictEqual(toJSON({
			orientation: 'landscape',
		}), {
			type: 'eval',
			request: {
				type: 'deviceSettings',
				deviceSettings: {type: 'setOrientation', params: {orientation: 'landscape'}},
			},
		}, 'type setOrientation');
	});
});
