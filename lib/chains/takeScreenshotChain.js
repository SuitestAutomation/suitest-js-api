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
const logger = require('../utils/logger');
const {validate, validators} = require('../validation');

const toJSON = () => ({type: 'takeScreenshot'});
const toString = t.takeScreenshot;
const beforeSendMsg = (data) => logger.log(
	getOpType(data),
	toString(),
);

const toStringComposer = makeToStringComposer(toString, toJSON);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString), beforeSendMsg);
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
const takeScreenshotChain = (dataFormat = 'raw') => makeChain(getComposers, {
	type: 'takeScreenshot',
	dataFormat: validate(
		validators.TAKE_SCREENSHOT,
		dataFormat,
		t.invalidInputMessage('takeScreenshot', 'Data format')
	),
});

module.exports = {
	takeScreenshot: takeScreenshotChain,
	// For Unit Testing
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
};