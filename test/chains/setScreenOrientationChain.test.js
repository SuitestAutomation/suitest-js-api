const assert = require('assert').strict;
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const SuitestApi = require('../../suitest');

const suitest = new SuitestApi();

describe('Set screen orientation chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = suitest.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE);

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.toAssert, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
		chain.abandon();
	});

	it('asserted chain should have all necessary modifiers', () => {
		const chain = suitest.assert.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE);

		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.toAssert, 'undefined');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
		chain.abandon();
	});

	it('should throw error if orientation no specified', () => {
		testInputErrorSync(suitest.setScreenOrientation, []);
		testInputErrorSync(suitest.setScreenOrientation, ['']);
		testInputErrorSync(suitest.setScreenOrientation, ['any random value']);
	});

	it('should generate correct socket message', () => {
		assert.deepEqual(
			suitest.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE).abandon().toJSON(),
			{
				type: 'eval',
				request: {
					type: 'deviceSettings',
					deviceSettings: {
						type: 'setOrientation',
						params: {
							orientation: 'landscape',
						},
					},
				},
			},
		);
		assert.deepEqual(
			suitest.assert.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE).abandon().toJSON(),
			{
				type: 'testLine',
				request: {
					type: 'deviceSettings',
					deviceSettings: {
						type: 'setOrientation',
						params: {
							orientation: 'landscape',
						},
					},
				},
			},
		);
	});
});

