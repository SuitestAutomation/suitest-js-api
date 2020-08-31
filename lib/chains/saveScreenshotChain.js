const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	makeToJSONComposer,
	abandonComposer,
} = require('../composers');
const t = require('../texts');
const {getOpType} = require('../utils/opType');
const {processServerResponse} = require('../utils/socketChainHelper');
const {validate, validators} = require('../validation');

const saveScreenshotFactory = (classInstance) => {
	const {logger} = classInstance;
	const toJSON = () => ({type: 'takeScreenshot'});
	const toString = t.saveScreenshot;
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		toString(),
	);

	const toStringComposer = makeToStringComposer(toString, toJSON);
	const thenComposer = makeThenComposer(toJSON, processServerResponse(logger, toString), beforeSendMsg);
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
		toString,
		toJSON,
		beforeSendMsg,
	};
};

module.exports = saveScreenshotFactory;
