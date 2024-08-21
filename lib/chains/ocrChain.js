const {
	makeToStringComposer,
	makeThenComposer,
	makeToJSONComposer,
	cloneComposer,
	assertComposer,
	abandonComposer,
	timeoutComposer,
} = require('../composers');
const makeChain = require('../utils/makeChain');
const {getRequestType} = require('../utils/socketChainHelper');
const {validate, validators} = require('../validation');
const {invalidInputMessage, assertOcrMalformed} = require('../texts');
const {applyTimeout} = require('../utils/chainUtils');
const SuitestError = require('../utils/SuitestError');
const {PROP_COMPARATOR} = require('../constants/comparator');

const validateOcrOptions = (ocrOptions) => {
	return ocrOptions === undefined ? undefined : validate(
		validators.OCR_OPTIONS,
		ocrOptions,
		invalidInputMessage('ocr', 'OCR data'),
	);
};

const validateOcrComparators = (ocrComparators) => {
	if (!Array.isArray(ocrComparators) || ocrComparators.length === 0) {
		throw new SuitestError(assertOcrMalformed(), SuitestError.INVALID_INPUT);
	}

	return validate(
		validators.OCR_COMPARATORS,
		ocrComparators,
		invalidInputMessage('ocr', 'OCR data'),
	);
};

/**
 * @description return copy of passed ocr comparator with default "type" property
 * @param {import('../../index.d.ts').OcrCommonItem} ocrItem
 * @returns {import('../../index.d.ts').OcrCommonItem}
 */
const ocrItemWithDefaultType = (ocrItem) => {
	const ocrItemCopy = {...ocrItem};

	if (ocrItemCopy.val !== undefined) {
		ocrItemCopy.type = ocrItemCopy.type || PROP_COMPARATOR.EQUAL;
	}

	return ocrItemCopy;
};

/**
 * @param {import('../../index.d.ts').ISuitest} classInstance
 */
const ocrFactory = (classInstance) => {
	const toJSON = (data) => {
		const subject = {type: 'ocr'};
		const socketMessage = {type: getRequestType(data)};

		if (socketMessage.type === 'query') {
			socketMessage.subject = subject;
			if (data.ocrItems) {
				socketMessage.subject.options = data.ocrItems;
			}
		} else {
			socketMessage.request = applyTimeout(
				{
					type: 'assert',
					condition: {
						subject,
						type: 'ocrComparators',
					},
				},
				data,
				classInstance.config.defaultTimeout,
			);
			if (data.ocrItems) {
				socketMessage.request.condition.comparators = validateOcrComparators(data.ocrItems);
			}
		}

		return socketMessage;
	};

	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer(toJSON);

	const getComposers = (data) => {
		const output = [
			toStringComposer,
			thenComposer,
			cloneComposer,
			toJSONComposer,
		];

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.timeout) {
			output.push(timeoutComposer);
		}

		return output;
	};

	const makeOcrChain = (ocrItems) => {
		return makeChain(
			classInstance,
			getComposers,
			{
				type: 'ocr',
				ocrItems,
			},
		);
	};

	return {
		ocr: (ocrOptions) => {
			const validatedOcrOptions = validateOcrOptions(ocrOptions);
			const processedOcrOptions = validatedOcrOptions && validatedOcrOptions.map(ocrItemWithDefaultType);

			return makeOcrChain(processedOcrOptions);
		},
		ocrAssert: (ocrComparators) => {
			const validatedOcrComparators = validateOcrComparators(ocrComparators);
			const processedOcrComparators = validatedOcrComparators.map(ocrItemWithDefaultType);

			return makeOcrChain(processedOcrComparators).toAssert();
		},

		// for unit tests
		getComposers,
		toJSON,
	};
};

module.exports = ocrFactory;
