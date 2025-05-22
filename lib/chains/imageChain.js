const fs = require('fs');
const {isNil} = require('ramda');
const {
	makeToStringComposer,
	makeThenComposer,
	makeToJSONComposer,
	cloneComposer,
	assertComposer,
	abandonComposer,
	timeoutComposer,
	visibleComposer,
	notComposer,
	inRegionComposer,
	accuracyComposer,
	onScreenComposer,
} = require('../composers');
const makeChain = require('../utils/makeChain');
const {getRequestType} = require('../utils/socketChainHelper');
const {validate, validators} = require('../validation');
const {invalidInputMessage, imageMalformed} = require('../texts');
const {applyTimeout, applyNegation} = require('../utils/chainUtils');
const SuitestError = require('../utils/SuitestError');
const {fetch} = require('../utils/fetch');
const {getAccuracy} = require('../composers/accuracyComposer');

/**
 * @param {import('../../index.d.ts').ISuitest} classInstance
 */
const imageChainFactory = (classInstance) => {
	const toJSON = (data) => {
		if (isNil(data.comparator)) {
			throw new SuitestError(imageMalformed(), SuitestError.INVALID_INPUT);
		}

		const socketMessage = {
			type: getRequestType(data, false),
			request: applyTimeout(
				{
					type: 'assert',
					condition: {
						subject: {
							type: 'image',
						},
						type: applyNegation(data.comparator.type, data),
					},
				},
				data,
				classInstance.config.defaultTimeout,
			),
		};

		const condition = socketMessage.request.condition;
		const accuracy = getAccuracy(data);

		if (accuracy) {
			condition.accuracy = accuracy;
		}

		if (data.imageData.apiId) {
			condition.subject.apiId = data.imageData.apiId;
		} else if (data.imageData.url) {
			condition.subject.url = data.imageData.url;
		} else if (data.imageData.filepath) {
			condition.subject.filepath = data.imageData.filepath;
		}

		if (data.region) {
			condition.region = data.region;
		}

		return socketMessage;
	};

	const toStringComposer = makeToStringComposer(toJSON);

	const thenComposer = makeThenComposer(async(data) => {
		const socketMessage = toJSON(data);

		if (data.imageData.apiId) {
			return socketMessage;
		}

		if (data.imageData.filepath) {
			const imageBuffer = await fs.promises.readFile(data.imageData.filepath);

			return [socketMessage, imageBuffer];
		}

		if (data.imageData.url) {
			const imageBuffer = await (await fetch(data.imageData.url)).buffer();

			return [socketMessage, imageBuffer];
		}

		return socketMessage;
	});

	const toJSONComposer = makeToJSONComposer(toJSON);

	const getComposers = (data) => {
		const output = [
			toStringComposer,
			thenComposer,
			cloneComposer,
			toJSONComposer,
			onScreenComposer,
		];

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.isNegated) {
			output.push(notComposer);
		}

		if (!data.timeout) {
			output.push(timeoutComposer);
		}

		if (!data.region) {
			output.push(inRegionComposer);
		}

		if (!data.comparator) {
			output.push(visibleComposer);
		}

		if (!data.accuracy) {
			output.push(accuracyComposer);
		}

		return output;
	};

	const makeImageChain = (imageData) => {
		const unifiedImageData = typeof imageData === 'string'
			? {apiId: imageData}
			: imageData;

		return makeChain(
			classInstance,
			getComposers,
			{
				type: 'image',
				imageData:
					validate(
						validators.IMAGE_DATA,
						unifiedImageData,
						invalidInputMessage('image', 'Image data'),
					),
			},
		);
	};

	return {
		image: makeImageChain,
		imageAssert: (data) => makeImageChain(data).toAssert(),

		// for unit tests
		getComposers,
		toJSON,
	};
};

module.exports = imageChainFactory;
