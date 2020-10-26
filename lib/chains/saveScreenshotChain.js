const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	makeToJSONComposer,
	abandonComposer,
} = require('../composers');
const t = require('../texts');
const {validate, validators} = require('../validation');

const saveScreenshotFactory = (classInstance) => {
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
	 * @param {string} fileName
	 */
	const saveScreenshotChain = (fileName) => makeChain(classInstance, getComposers, {
		type: 'takeScreenshot',
		fileName: validate(
			validators.NON_EMPTY_STRING,
			fileName,
			t.invalidInputMessage('saveScreenshot', 'File name'),
		),
	});

	return {
		saveScreenshot: saveScreenshotChain,
		// For Unit Testing
		getComposers,
		toJSON,
	};
};

module.exports = saveScreenshotFactory;
