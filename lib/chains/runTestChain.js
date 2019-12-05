const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');

const {
	repeatComposer,
	abandonComposer,
	makeThenComposer,
	makeToStringComposer,
	cloneComposer,
	gettersComposer,
	assertComposer,
	makeToJSONComposer,
	untilComposer,
} = require('../composers');
const {
	runTest,
	chainRepeat,
	invalidInputMessage,
} = require('../texts');
const {validate, validators} = require('../validation');
const {
	processServerResponse,
	getRequestType,
	applyCount,
	applyUntilCondition,
} = require('../utils/socketChainHelper');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

const toString = data => {
	const repeat = data.repeat;
	let out = runTest(data.testId);

	if (repeat) {
		out += chainRepeat(repeat);
	}

	return out;
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

const toJSON = (data) => ({
	type: getRequestType(data, false),
	request: compose(
		msg => applyUntilCondition(msg, data),
		msg => applyCount(msg, data),
	)({
		type: 'runSnippet',
		val: data.testId,
	}),
});

const toStringComposer = makeToStringComposer(toString);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString), beforeSendMsg);
const toJSONComposer = makeToJSONComposer(toJSON);

const getComposers = data => {
	const output = [
		toStringComposer,
		thenComposer,
		cloneComposer,
		gettersComposer,
		toJSONComposer,
	];

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.repeat) {
		output.push(repeatComposer);
	}

	if (!data.until) {
		output.push(untilComposer);
	}

	return output;
};

const runTestChain = testId => makeChain(getComposers, {
	type: 'runSnippet',
	testId: validate(validators.NON_EMPTY_STRING, testId, invalidInputMessage('runTest', 'Test ID')),
});

module.exports = {
	runTestAssert: testId => runTestChain(testId).toAssert(),

	// For testing
	runTest: runTestChain,
	toJSON,
	beforeSendMsg,
};
