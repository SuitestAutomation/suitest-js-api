const assert = require('assert');
const {
	nativeVideo,
	nativeVideoAssert,
} = require('../../lib/chains/nativeVideoChain');
const {ELEMENT_PROP} = require('../../lib/constants/element');
const {PROP_COMPARATOR} = require('../../lib/constants/comparator');

describe('Native video chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = nativeVideo();

		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'function');
		assert.strictEqual(typeof chain.matches, 'function');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'function');
		assert.strictEqual(typeof chain.isStopped, 'function');
		assert.strictEqual(typeof chain.isPaused, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after match is applied', () => {
		const chain = nativeVideo().match(ELEMENT_PROP.ID, 'someId');

		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.match, 'undefined');
		assert.strictEqual(typeof chain.matches, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.isPlaying, 'undefined');
		assert.strictEqual(typeof chain.isPaused, 'undefined');
		assert.strictEqual(typeof chain.isStopped, 'undefined');
	});

	it('should convert to string with meaningful message', () => {
		assert.strictEqual(nativeVideo().toString(), 'Getting properties of "native video"');
		assert.strictEqual(
			nativeVideo().matches(ELEMENT_PROP.ID, 'someId').toString(),
			'Checking if "native video" matches:\n' +
			'  id = someId'
		);
		assert.strictEqual(
			nativeVideo().matches(ELEMENT_PROP.ID, 'someId').timeout(4000).toString(),
			'Checking if "native video" matches:\n' +
			'  id = someId'
		);
	});

	describe('should generate proper JSON', () => {
		it('for initial state', () => {
			assert.deepStrictEqual(
				nativeVideo().toJSON(),
				{
					subject: {
						selector: {
							nativeVideo: true,
						},
						type: 'elementProps',
					},
					type: 'query',
				},
				'generate JSON for initial native video'
			);

			assert.deepStrictEqual(
				nativeVideoAssert().toJSON(),
				{type: 'testLine'},
				'generate JSON for asserted initial native video'
			);
		});

		it('for matching properties', () => {
			assert.deepStrictEqual(
				nativeVideo().match({
					name: ELEMENT_PROP.WIDTH,
					val: 300,
					type: PROP_COMPARATOR.APPROX,
					deviation: 20,
				}).toJSON(),
				{
					request: {
						condition: {
							expression: [
								{
									property: 'width',
									type: '+-',
									val: 300,
									deviation: 20,
								},
							],
							subject: {
								type: 'element',
								val: {
									nativeVideo: true,
								},
							},
							type: 'has',
						},
						timeout: 2000,
						type: 'wait',
					},
					type: 'eval',
				},
				'generate JSON for native video .match()'
			);

			assert.deepStrictEqual(
				nativeVideoAssert().match({
					name: ELEMENT_PROP.WIDTH,
					val: 300,
					type: PROP_COMPARATOR.APPROX,
					deviation: 20,
				}).toJSON(),
				{
					request: {
						condition: {
							expression: [
								{
									property: 'width',
									type: '+-',
									val: 300,
									deviation: 20,
								},
							],
							subject: {
								type: 'element',
								val: {
									nativeVideo: true,
								},
							},
							type: 'has',
						},
						timeout: 2000,
						type: 'wait',
					},
					type: 'testLine',
				},
				'generate JSON for asserted native video .match()'
			);
		});

		it('for timeout', () => {
			assert.deepStrictEqual(
				nativeVideo().timeout(3000).toJSON(),
				{
					subject: {
						selector: {
							nativeVideo: true,
						},
						type: 'elementProps',
					},
					type: 'query',
				},
			);
			assert.deepStrictEqual(
				nativeVideoAssert().timeout(3000).toJSON(),
				{type: 'testLine'},
			);
			assert.deepStrictEqual(
				nativeVideo().match({
					name: ELEMENT_PROP.WIDTH,
					val: 300,
					type: PROP_COMPARATOR.APPROX,
					deviation: 20,
				}).timeout(4000).toJSON(),
				{
					request: {
						condition: {
							expression: [
								{
									deviation: 20,
									property: 'width',
									type: '+-',
									val: 300,
								},
							],
							subject: {
								type: 'element',
								val: {
									nativeVideo: true,
								},
							},
							type: 'has',
						},
						timeout: 4000,
						type: 'wait',
					},
					type: 'eval',
				},
			);
			assert.deepStrictEqual(
				nativeVideoAssert().match({
					name: ELEMENT_PROP.WIDTH,
					val: 300,
					type: PROP_COMPARATOR.APPROX,
					deviation: 20,
				}).timeout(4000).toJSON(),
				{
					request: {
						condition: {
							expression: [
								{
									deviation: 20,
									property: 'width',
									type: '+-',
									val: 300,
								},
							],
							subject: {
								type: 'element',
								val: {
									nativeVideo: true,
								},
							},
							type: 'has',
						},
						timeout: 4000,
						type: 'wait',
					},
					type: 'testLine',
				},
			);
		});
	});

	it('should define assert function', () => {
		const chain = nativeVideoAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});
});
