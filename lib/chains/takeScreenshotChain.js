const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	makeToJSONComposer,
	abandonComposer,
} = require('../composers');
const t = require('../texts');
const {validate, validators} = require('../validation');

const takeScreenshotFactory = (classInstance) => {
	const toJSON = () => ({type: 'takeScreenshot'});

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
	const takeScreenshotChain = (dataFormat = 'raw') => makeChain(classInstance, getComposers, {
		type: 'takeScreenshot',
		dataFormat: validate(
			validators.TAKE_SCREENSHOT,
			dataFormat,
			t.invalidInputMessage('takeScreenshot', 'Data format'),
		),
	});

	return {
		takeScreenshot: takeScreenshotChain,
		// For Unit Testing
		getComposers,
		toJSON,
	};
};

module.exports = takeScreenshotFactory;
