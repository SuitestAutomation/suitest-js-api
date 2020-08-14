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
const {processServerResponse, getRequestType} = require('../utils/socketChainHelper');
const {applyCount, applyUntilCondition, processJsonMessageForToString} = require('../utils/chainUtils');
const getOpType = require('../utils/opType').getOpType;

const runTestFactory = (classInstance) => {
	const {logger} = classInstance;
	const toString = jsonMessage => {
		const def = processJsonMessageForToString(jsonMessage);
		const count = def.count;

		let out = runTest(def.val);

		if (count) {
			out += chainRepeat(count);
		}

		return out;
	};
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data)
	);

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

	const toStringComposer = makeToStringComposer(toString, toJSON);
	const thenComposer = makeThenComposer(toJSON, processServerResponse(logger, toString), beforeSendMsg);
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

	const runTestChain = testId => makeChain(classInstance, getComposers, {
		type: 'runSnippet',
		testId: validate(validators.NON_EMPTY_STRING, testId, invalidInputMessage('runTest', 'Test ID')),
	});

	return {
		runTestAssert: testId => runTestChain(testId).toAssert(),

		// For testing
		runTest: runTestChain,
		toJSON,
		beforeSendMsg,
	};
};

module.exports = runTestFactory;
