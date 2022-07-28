const assert = require('assert');
const suitest = require('../../index');
const {
	video,
	videoAssert,
	toJSON,
} = require('../../lib/chains/videoChain')(suitest);
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {ELEMENT_PROP} = require('../../lib/constants/element');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const SuitestError = require('../../lib/utils/SuitestError');

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
		assert.strictEqual(typeof chain.visible, 'function');
		assert.strictEqual(typeof chain.match, 'function');
		assert.strictEqual(typeof chain.matches, 'function');
		assert.strictEqual(typeof chain.matchRepo, 'function');
		assert.strictEqual(typeof chain.matchesRepo, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		assert.strictEqual(typeof chain.isPlaying, 'function');
		assert.strictEqual(typeof chain.isStopped, 'function');
		assert.strictEqual(typeof chain.isPaused, 'function');
		// assert.strictEqual(typeof chain.matchBrightScript, 'function');
		// assert.strictEqual(typeof chain.matchesBrightScript, 'function');
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

	it('should have only allowed modifiers after matchJS is applied', () => {
		const chain = video().abandon();

		assert.strictEqual(typeof chain.abandon, 'undefined');
	});

	it('should have only allowed modifiers after exists or visible is applied', () => {
		let chain = video().not();

		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.visible, 'function');

		chain = video().visible();

		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
	});

	it('should define assert function', () => {
		const chain = videoAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({
			selector: {video: true},
		}), {
			type: 'query',
			subject: {
				type: 'elementProps',
				selector: {video: true},
			},
		}, 'query');
		assert.deepStrictEqual(toJSON({
			isNegated: true,
			comparator: {
				type: SUBJ_COMPARATOR.EXIST,
			},
			selector: {video: true},
			timeout: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'video',
					},
					type: '!exists',
				},
				timeout: 2000,
			},
		}, 'video does not exist testLine');
		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.VISIBLE,
			},
			selector: {video: true},
			timeout: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'video',
					},
					type: 'visible',
				},
				timeout: 2000,
			},
		}, 'video visible testLine');
		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.VISIBLE,
			},
			isNegated: true,
			selector: {apiId: 'apiId'},
			timeout: 2000,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'video',
					},
					type: '!visible',
				},
				timeout: 2000,
			},
		}, 'element not visible testLine');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			comparator: {
				type: SUBJ_COMPARATOR.MATCH_JS,
				val: '1+1',
			},
			selector: {video: true},
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'video',
					},
					type: 'matches',
					val: '1+1',
				},
				timeout: 2000,
			},
		}, 'video mathces js testLine');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			comparator: {
				type: SUBJ_COMPARATOR.MATCH_BRS,
				val: '1+1',
			},
			selector: {video: true},
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'video',
					},
					type: 'matchesBRS',
					val: '1+1',
				},
				timeout: 2000,
			},
		}, 'video mathces bs testLine');
	});

	it('should return text representation of video line', () => {
		assert.strictEqual(
			video().toString(),
			'|E|Retrieve info of video element',
		);
		assert.strictEqual(
			videoAssert().exists().toString(),
			'|A|Assert: \x1B[32mvideo\x1B[0m exists timeout \x1B[4m2s\x1B[0m',
		);
	});

	it('should throw correct error when video line is malformed', () => {
		function isSuitestErrorInvalidInput(err) {
			return err instanceof SuitestError &&
				err.code === SuitestError.INVALID_INPUT &&
				err.message.includes('Video line is malformed');
		}
		assert.throws(
			() => videoAssert().toString(),
			isSuitestErrorInvalidInput,
		);
	});
});
