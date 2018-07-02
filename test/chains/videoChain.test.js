const assert = require('assert');
const {
	video,
	videoAssert,
} = require('../../lib/chains/videoChain');
const {ELEMENT_PROP} = require('../../lib/constants/element');

describe('Video chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = video();

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.exist, 'function');
		assert.strictEqual(typeof chain.exists, 'function');
		assert.strictEqual(typeof chain.match, 'function');
		assert.strictEqual(typeof chain.matches, 'function');
		assert.strictEqual(typeof chain.matchRepo, 'function');
		assert.strictEqual(typeof chain.matchesRepo, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after match is applied', () => {
		const chain = video().match(ELEMENT_PROP.ID, 'someId');

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
	});

	it('should have only allowed modifiers after matchJS is applied', () => {
		const chain = video().abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should have only allowed modifiers after exists is applied', () => {
		const chain = video().not();

		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(video().toString(), 'Get video element properties');
		assert.equal(video().exists().toString(), 'Check if video element exists');
		assert.equal(
			video().matchesJS('').toString(),
			'Check if video element matches JavaScript expression'
		);
		assert.equal(
			video().matches(ELEMENT_PROP.ID, 'someId').toString(),
			'Check if video element has defined properties'
		);
	});

	it.skip('should engage execution on "then"', async() => {
		assert.strictEqual(await video(), 'element');
	});
	it('should define assert function', () => {
		const chain = videoAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});
});
