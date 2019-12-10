const assert = require('assert');
const sinon = require('sinon');
const {
	playstationVideo,
	playstationVideoAssert,
	beforeSendMsg,
} = require('../../lib/chains/playstationVideoChain');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const {ELEMENT_PROP} = require('../../lib/constants/element');
const VIDEO_STATE = require('../../lib/constants/videoState');
const HAD_NO_ERROR = require('../../lib/constants/hadNoError');
const {PROP_COMPARATOR} = require('../../lib/constants/comparator');

describe('Playstation video chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = playstationVideo();

		// exists in playstationVideo
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
		assert.strictEqual(typeof chain.match, 'function');
		assert.strictEqual(typeof chain.matches, 'function');
		assert.strictEqual(typeof chain.isPlaying, 'function');
		assert.strictEqual(typeof chain.isStopped, 'function');
		assert.strictEqual(typeof chain.isPaused, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.hadNoError, 'function');

		// not exists in playstationVideo
		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.exist, 'undefined');
		assert.strictEqual(typeof chain.exists, 'undefined');
		assert.strictEqual(typeof chain.visible, 'undefined');
		assert.strictEqual(typeof chain.matchRepo, 'undefined');
		assert.strictEqual(typeof chain.matchesRepo, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after match is applied', () => {
		const chain = playstationVideo().match(ELEMENT_PROP.VIDEO_STATE, VIDEO_STATE.PAUSED);

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
		assert.strictEqual(typeof chain.hadNoError, 'undefined');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
	});

	it('should have only allowed modifiers after hadNoError is applied', () => {
		const chain = playstationVideo().hadNoError();

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
		assert.strictEqual(typeof chain.hadNoError, 'undefined');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
		assert.strictEqual(typeof chain.then, 'function');
	});

	it('should convert to string with meaningful message', () => {
		assert.strictEqual(playstationVideo().toString(), 'Getting properties of "PlayStation WebMAF video"');
		assert.strictEqual(
			playstationVideo().matches(ELEMENT_PROP.VIDEO_URL, 'some/url').toString(),
			'Checking if "PlayStation WebMAF video" matches:\n' +
			'  videoUrl = some/url'
		);
		assert.strictEqual(
			playstationVideo().matches(ELEMENT_PROP.VIDEO_URL, 'some/url').timeout(4000).toString(),
			'Checking if "PlayStation WebMAF video" matches:\n' +
			'  videoUrl = some/url'
		);
		assert.strictEqual(
			playstationVideo().hadNoError(HAD_NO_ERROR.CURRENT_URL).toString(),
			'PlayStation WebMAF video had no errors for current video URL',
		);
		assert.strictEqual(
			playstationVideo().hadNoError(HAD_NO_ERROR.ALL).toString(),
			'PlayStation WebMAF video had no errors in entire video log',
		);
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');
		const beforeSendMsgContains = assertBeforeSendMsg(beforeSendMsg, log);

		beforeSendMsgContains({}, 'Launcher E Getting properties of "PlayStation WebMAF video"');
		beforeSendMsgContains(
			{
				comparator: {type: 'hadNoError'},
				searchStrategy: 'all',
			},
			'Launcher E PlayStation WebMAF video had no errors in entire video log');
		beforeSendMsgContains(
			{
				comparator: {type: 'hadNoError'},
				searchStrategy: 'all',
				isAssert: true,
			},
			'Launcher A PlayStation WebMAF video had no errors in entire video log'
		);
		log.restore();
	});

	describe('should generate proper JSON', () => {
		it('for initial state', () => {
			assert.deepStrictEqual(
				playstationVideo().toJSON(),
				{
					subject: {
						selector: {
							psVideo: true,
						},
						type: 'elementProps',
					},
					type: 'query',
				},
				'generate JSON for initial native video'
			);

			assert.deepStrictEqual(
				playstationVideoAssert().toJSON(),
				{type: 'testLine'},
				'generate JSON for asserted initial native video'
			);
		});

		it('for matching properties', () => {
			assert.deepStrictEqual(
				playstationVideo().match({
					name: ELEMENT_PROP.VIDEO_LENGTH,
					val: 300,
					type: PROP_COMPARATOR.APPROX,
					deviation: 20,
				}).toJSON(),
				{
					request: {
						condition: {
							expression: [
								{
									property: 'videoLength',
									type: '+-',
									val: 300,
									deviation: 20,
								},
							],
							subject: {
								type: 'psVideo',
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
				playstationVideoAssert().match({
					name: ELEMENT_PROP.VIDEO_LENGTH,
					val: 300,
					type: PROP_COMPARATOR.APPROX,
					deviation: 20,
				}).toJSON(),
				{
					request: {
						condition: {
							expression: [
								{
									property: 'videoLength',
									type: '+-',
									val: 300,
									deviation: 20,
								},
							],
							subject: {
								type: 'psVideo',
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

		it('for hadNoError', () => {
			const hadNoErrorForCurrentUrl = {
				request: {
					condition: {
						subject: {
							type: 'psVideo',
						},
						type: 'hadNoError',
						searchStrategy: 'currentUrl',
					},
					timeout: 2000,
					type: 'wait',
				},
				type: 'eval',
			};

			assert.deepStrictEqual(playstationVideo().hadNoError().toJSON(), hadNoErrorForCurrentUrl);
			assert.deepStrictEqual(
				playstationVideo().hadNoError(HAD_NO_ERROR.CURRENT_URL).toJSON(),
				hadNoErrorForCurrentUrl
			);

			assert.deepStrictEqual(
				playstationVideo().hadNoError(HAD_NO_ERROR.ALL).toJSON(),
				{
					request: {
						condition: {
							subject: {
								type: 'psVideo',
							},
							type: 'hadNoError',
							searchStrategy: 'all',
						},
						timeout: 2000,
						type: 'wait',
					},
					type: 'eval',
				}
			);
		});

		it('for timeout', () => {
			assert.deepStrictEqual(
				playstationVideo().timeout(3000).toJSON(),
				{
					subject: {
						selector: {
							psVideo: true,
						},
						type: 'elementProps',
					},
					type: 'query',
				},
			);
			assert.deepStrictEqual(
				playstationVideoAssert().timeout(3000).toJSON(),
				{type: 'testLine'},
			);
			assert.deepStrictEqual(
				playstationVideo().match({
					name: ELEMENT_PROP.VIDEO_LENGTH,
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
									property: 'videoLength',
									type: '+-',
									val: 300,
								},
							],
							subject: {
								type: 'psVideo',
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
				playstationVideoAssert().match({
					name: ELEMENT_PROP.VIDEO_LENGTH,
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
									property: 'videoLength',
									type: '+-',
									val: 300,
								},
							],
							subject: {
								type: 'psVideo',
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
		const chain = playstationVideoAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});
});
