const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	makeToJSONComposer,
	abandonComposer,
} = require('../composers');
const t = require('../texts');
const {validate, validators} = require('../validation');

/**
 * @param {import('../../index.d.ts').ISuitest} classInstance
 */
const getLastVTScreenshot = (classInstance) => {
	const toJSON = () => ({type: 'lastScreenshot'});

	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer(toJSON);

	const getComposers = (data) => {
		const output = [
			toStringComposer,
			thenComposer,
			toJSONComposer,
		];

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		return output;
	};

	/**
	 * @param {'raw' | 'base64'} [dataFormat]
	 * @returns {*}
	 */
	const getLastVTScreenshotChain = (dataFormat = 'raw') => makeChain(classInstance, getComposers, {
		type: 'lastScreenshot',
		dataFormat: validate(
			validators.LAST_SCREENSHOT,
			dataFormat,
			t.invalidInputMessage('getLastVTScreenshot', 'Data format'),
		),
	});

	return {
		getLastVTScreenshot: getLastVTScreenshotChain,
		// For Unit Testing
		getComposers,
		toJSON,
	};
};

module.exports = getLastVTScreenshot;
