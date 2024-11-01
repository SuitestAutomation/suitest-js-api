const assert = require('assert');
const {EOL} = require('node:os');
const suitest = require('../../index');
const {
	image,
	imageAssert,
	toJSON,
	getComposers,
} = require('../../lib/chains/imageChain')(suitest);
const composers = require('../../lib/constants/composer');
const {getComposerTypes, bySymbol, excludeComposer} = require('../../lib/utils/testHelpers');
const SuitestError = require('../../lib/utils/SuitestError');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const ACCURACY = require('../../lib/constants/accuracy');

const suitestInvalidInputError = (message) => {
	return new SuitestError(message, SuitestError.INVALID_INPUT);
};

const allImageComposers = [
	composers.TO_STRING,
	composers.THEN,
	composers.ABANDON,
	composers.CLONE,
	composers.TIMEOUT,
	composers.TO_JSON,
	composers.ASSERT,
	composers.NOT,
	composers.VISIBLE,
	composers.IN_REGION,
	composers.ACCURACY,
];

describe('Image chain', () => {
	it('should have all necessary modifiers', () => {
		const composerTypes = getComposerTypes(getComposers({}));

		assert.deepStrictEqual(composerTypes, allImageComposers.sort(bySymbol));

		assert.deepStrictEqual(
			getComposerTypes(getComposers({isAssert: true})),
			excludeComposer(allImageComposers, composers.ASSERT),
		);

		assert.deepStrictEqual(
			getComposerTypes(getComposers({isAbandoned: true})),
			excludeComposer(allImageComposers, composers.ABANDON),
		);

		assert.deepStrictEqual(
			getComposerTypes(getComposers({isNegated: true})),
			excludeComposer(allImageComposers, composers.NOT),
		);

		assert.deepStrictEqual(
			getComposerTypes(getComposers({timeout: 1000})),
			excludeComposer(allImageComposers, composers.TIMEOUT),
		);

		assert.deepStrictEqual(
			getComposerTypes(getComposers({region: []})),
			excludeComposer(allImageComposers, composers.IN_REGION),
		);

		assert.deepStrictEqual(
			getComposerTypes(getComposers({accuracy: ACCURACY.LOW})),
			excludeComposer(allImageComposers, composers.ACCURACY),
		);

		assert.deepStrictEqual(
			getComposerTypes(getComposers({comparator: {type: SUBJ_COMPARATOR.VISIBLE}})),
			excludeComposer(allImageComposers, composers.VISIBLE),
		);
	});

	describe('should generate correct socket message', () => {
		it('evaluate is image visible', () => {
			const socketMessage = {
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: SUBJ_COMPARATOR.VISIBLE,
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					imageData: {apiId: 'image-api-id'},
					comparator: {type: SUBJ_COMPARATOR.VISIBLE},
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				image({apiId: 'image-api-id'}).visible().toJSON(),
				socketMessage,
			);
		});

		it('assert is image visible', () => {
			const socketMessage = {
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: SUBJ_COMPARATOR.VISIBLE,
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					isAssert: true,
					imageData: {apiId: 'image-api-id'},
					comparator: {type: SUBJ_COMPARATOR.VISIBLE},
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				imageAssert({apiId: 'image-api-id'}).visible().toJSON(),
				socketMessage,
			);
		});

		it('evaluate is image not visible', () => {
			const socketMessage = {
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: '!' + SUBJ_COMPARATOR.VISIBLE,
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					imageData: {apiId: 'image-api-id'},
					comparator: {type: '!' + SUBJ_COMPARATOR.VISIBLE},
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				image({apiId: 'image-api-id'}).not().visible().toJSON(),
				socketMessage,
			);
		});

		it('assert is image not visible', () => {
			const socketMessage = {
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: '!' + SUBJ_COMPARATOR.VISIBLE,
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					isAssert: true,
					imageData: {apiId: 'image-api-id'},
					comparator: {type: '!' + SUBJ_COMPARATOR.VISIBLE},
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				imageAssert({apiId: 'image-api-id'}).not().visible().toJSON(),
				socketMessage,
			);
		});

		it('evaluate image is visible in region', () => {
			const socketMessage = {
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: SUBJ_COMPARATOR.VISIBLE,
						region: [20, 20, 20, 20],
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					imageData: {apiId: 'image-api-id'},
					comparator: {type: SUBJ_COMPARATOR.VISIBLE},
					region: [20, 20, 20, 20],
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				image({apiId: 'image-api-id'})
					.visible()
					.inRegion([20, 20, 20, 20])
					.toJSON(),
				socketMessage,
			);
		});

		it('evaluate image is not visible in region', () => {
			const socketMessage = {
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: '!' + SUBJ_COMPARATOR.VISIBLE,
						region: [20, 20, 20, 20],
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					imageData: {apiId: 'image-api-id'},
					comparator: {type: '!' + SUBJ_COMPARATOR.VISIBLE},
					region: [20, 20, 20, 20],
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				image({apiId: 'image-api-id'})
					.not()
					.visible()
					.inRegion([20, 20, 20, 20])
					.toJSON(),
				socketMessage,
			);
		});

		it('assert image is visible in region', () => {
			const socketMessage = {
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: SUBJ_COMPARATOR.VISIBLE,
						region: [20, 20, 20, 20],
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					isAssert: true,
					imageData: {apiId: 'image-api-id'},
					comparator: {type: SUBJ_COMPARATOR.VISIBLE},
					region: [20, 20, 20, 20],
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				imageAssert({apiId: 'image-api-id'})
					.visible()
					.inRegion([20, 20, 20, 20])
					.toJSON(),
				socketMessage,
			);
		});

		it('assert image is not visible in region', () => {
			const socketMessage = {
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							apiId: 'image-api-id',
						},
						type: '!' + SUBJ_COMPARATOR.VISIBLE,
						region: [20, 20, 20, 20],
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					isAssert: true,
					imageData: {apiId: 'image-api-id'},
					comparator: {type: '!' + SUBJ_COMPARATOR.VISIBLE},
					region: [20, 20, 20, 20],
				}),
				socketMessage,
			);
			assert.deepStrictEqual(
				imageAssert({apiId: 'image-api-id'})
					.not()
					.visible()
					.inRegion([20, 20, 20, 20])
					.toJSON(),
				socketMessage,
			);
		});

		it('"filepath", "url" should be added', () => {
			const messageWIthImageUrl = {
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							url: 'https://suite.st/',
						},
						type: SUBJ_COMPARATOR.VISIBLE,
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					imageData: {url: 'https://suite.st/'},
					comparator: {type: SUBJ_COMPARATOR.VISIBLE},
				}),
				messageWIthImageUrl,
			);
			assert.deepStrictEqual(
				image({url: 'https://suite.st/'})
					.visible()
					.toJSON(),
				messageWIthImageUrl,
			);

			const messageWIthImageFilepath = {
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
							filepath: '/assets/image.png',
						},
						type: SUBJ_COMPARATOR.VISIBLE,
					},
					timeout: 2000,
				},
			};

			assert.deepStrictEqual(
				toJSON({
					imageData: {filepath: '/assets/image.png'},
					comparator: {type: SUBJ_COMPARATOR.VISIBLE},
				}),
				messageWIthImageFilepath,
			);
			assert.deepStrictEqual(
				image({filepath: '/assets/image.png'})
					.visible()
					.toJSON(),
				messageWIthImageFilepath,
			);
		});

		it('with specified accuracy', () => {
			const socketMessageWith = (accuracy) => ({
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							apiId: 'some-api-id',
							type: 'image',
						},
						type: 'visible',
						accuracy,
					},
					timeout: 2000,
				},
			});

			const socketMessageWithLowAccuracy = image('some-api-id').accuracy(ACCURACY.LOW).visible().toJSON();

			assert.deepStrictEqual(
				socketMessageWithLowAccuracy,
				socketMessageWith(ACCURACY.LOW),
			);
			const socketMessageWithMediumAccuracy = image('some-api-id').accuracy(ACCURACY.MEDIUM).visible().toJSON();

			assert.deepStrictEqual(
				socketMessageWithMediumAccuracy,
				socketMessageWith(ACCURACY.MEDIUM),
			);
			const socketMessageWithHighAccuracy = image('some-api-id').accuracy(ACCURACY.HIGH).visible().toJSON();

			assert.deepStrictEqual(
				socketMessageWithHighAccuracy,
				socketMessageWith(ACCURACY.HIGH),
			);
		});
	});

	it('image should accept string', () => {
		const socketMessage = image('some-api-id').visible().toJSON();

		assert.deepStrictEqual(
			socketMessage,
			{
				type: 'eval',
				request: {
					type: 'assert',
					condition: {
						subject: {
							apiId: 'some-api-id',
							type: 'image',
						},
						type: 'visible',
					},
					timeout: 2000,
				},
			},
		);
	});

	describe('should throw error', () => {
		it('if image data is not an object', () => {
			const imageDataShouldBeObject =
				suitestInvalidInputError('Invalid input provided for .image function. Image data should be object');

			assert.throws(() => image(), imageDataShouldBeObject);
			assert.throws(() => image([]), imageDataShouldBeObject);
			assert.throws(() => image(null), imageDataShouldBeObject);
			assert.throws(() => image(123), imageDataShouldBeObject);
		});

		it('if image data do not contains any of "url", "filepath", "apiId"', () => {
			const anyOfRequiredPropsShouldBeDefinedError = suitestInvalidInputError(
				`Invalid input provided for .image function. Image data ${EOL}` +
				`\tshould have required property '.url'${EOL}` +
				`\tshould have required property '.filepath'${EOL}` +
				`\tshould have required property '.apiId'${EOL}` +
				'\tshould match some schema in anyOf',
			);

			assert.throws(() => image({}), anyOfRequiredPropsShouldBeDefinedError);
			assert.throws(
				() => image({url: undefined, filepath: undefined, apiId: undefined}),
				anyOfRequiredPropsShouldBeDefinedError,
			);
		});

		it('if image url is not a string', () => {
			const imageUrlShouldBeString = suitestInvalidInputError(
				'Invalid input provided for .image function. Image data .url should be string',
			);

			assert.throws(() => image({url: null}), imageUrlShouldBeString);
		});

		it('if image filepath is not a string', () => {
			const imageFilepathShouldBeString = suitestInvalidInputError(
				'Invalid input provided for .image function. Image data .filepath should be string',
			);

			assert.throws(() => image({filepath: null}), imageFilepathShouldBeString);
		});

		it('if image apiId is not a string', () => {
			const apiIdShouldBeString = suitestInvalidInputError(
				'Invalid input provided for .image function. Image data .apiId should be string',
			);

			assert.throws(() => image({apiId: null}), apiIdShouldBeString);
		});

		it('if accuracy is not "high", "medium" or "low"', () => {
			const invalidAccuracyError = suitestInvalidInputError(
				'Invalid input provided for .accuracy function. Accuracy should be equal to one of the allowed values: "high", "medium", "low"',
			);

			assert.throws(
				() => image('').accuracy(null),
				suitestInvalidInputError(
					'Invalid input provided for .accuracy function. Accuracy should be string',
				),
			);
			assert.throws(() => image('').accuracy(''), invalidAccuracyError);
			assert.throws(() => image('').accuracy('loww'), invalidAccuracyError);
		});

		it('if image chain data is malformed', () => {
			const imageLineIsMalformedError = suitestInvalidInputError('Image line is malformed');

			assert.throws(() => toJSON({}), imageLineIsMalformedError);
			assert.throws(() => image({apiId: 'some-id'}).toJSON(), imageLineIsMalformedError);
			assert.throws(
				() => toJSON({region: [20, 20, 20, 20]}),
				imageLineIsMalformedError,
			);
			assert.throws(
				() => image({apiId: 'some-id'})
					.inRegion([20, 20, 20, 20])
					.toJSON(),
				imageLineIsMalformedError,
			);
		});
	});
});
