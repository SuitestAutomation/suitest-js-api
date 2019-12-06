const {compose, uniq} = require('ramda');
const {authContext, appContext} = require('../context');
const endpoints = require('../api/endpoints');
const request = require('../api/request');
const colors = require('colors');

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
	runTestStart,
	runTestWithChanges,
	runTestEnd,
	runTestLoopCount,
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

const chainName = 'runTest';

const toString = data => {
	const repeat = data.repeat;
	let out = runTestStart(data.val || data.testId); // TODO: use val when we can translate jsons

	if (repeat) {
		out += chainRepeat(repeat);
	}

	return out;
};

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

const logLine = msg => logger.log('|A|', msg);

// TODO: replace these with real translation functions
const translateLine = lineDef => lineDef.type === 'runSnippet' ? toString(lineDef) : lineDef.type;
const translateError = lineDef => colors.red(translateLine(lineDef));
const translateLineResult = (lineDef, response) => {
	return response.result === 'success' ? translateLine(lineDef) : translateError(lineDef);
};

/**
 * Get snippet lines output recursively
 * @param {Object} data
 * @param {string} data.testId - id of root test
 * @param {Object} data.definitions - test definitions by id
 * @param {Array} data.results - results for current runSnippet line
 * @param {boolean} data.withChanges - include changes or not
 * @param {number} data.level - level for indentation, initially 1
 * @param {(line, result) => string} data.translateResult - function to translate line results
 */
const getSnippetLogs = ({testId, definitions, results, withChanges, level, translateResult}) => {
	const indent = ' '.repeat(4 * level);

	return results.reduce((logs, res) => {
		const idx = res.lineId.split('-').map(Number)[level] - 1;
		const line = definitions[testId][idx];

		logs.push(indent + translateResult(line, res));

		if (res.results || res.loopResults) {
			const getLoopLogs = loopRes => getSnippetLogs({
				testId: line.val,
				definitions,
				results: loopRes,
				withChanges,
				level: level + 1,
				translateResult,
			});

			logs.push(indent + runTestWithChanges(withChanges));
			if (res.loopResults) {
				res.loopResults.forEach((loop, idx) => {
					logs.push(indent + runTestLoopCount(idx + 1));
					logs.push(...getLoopLogs(loop.results));
				});
			} else {
				logs.push(...getLoopLogs(res.results));
			}
			logs.push(indent + runTestEnd(line.val));
		}

		return logs;
	}, []);
};

/**
 * Fetch test definitions recursively for all snippet lines
 * @param {string} appId
 * @param {string} versionId
 * @param {string} testId
 * @param {boolean} includeChangelist
 */
const fetchTestDefinitions = async(appId, versionId, testId, includeChangelist) => {
	const authedRequestObject = await authContext.authorizeHttp(
		endpoints.appTestDefinitionById,
		{method: 'GET'},
		{commandName: chainName}
	);

	const testDefinitionsById = {};

	const fetchSingleTest = async(testId) => {
		const {definition} = await request(
			[
				`${endpoints.appTestDefinitionById}?includeChangelist=${includeChangelist}`,
				{appId, versionId, testId},
			],
			authedRequestObject
		);

		testDefinitionsById[testId] = definition;

		const snippetsToFetch = uniq(
			definition
				.filter(line => line.type === 'runSnippet'
					&& line.val
					&& !line.excluded
					&& !testDefinitionsById.hasOwnProperty(line.val)
				)
				.map(line => line.val)
		);

		await Promise.all(snippetsToFetch.map(fetchSingleTest));
	};

	await fetchSingleTest(testId);

	return testDefinitionsById;
};

const thenComposer = (...args) => {
	const isInteractiveSession = authContext.isInteractiveSession();
	let testDefinitionPromise;

	const before = async(data) => {
		const {appId, versionId} = appContext.context;
		const {testId} = data;

		logLine(translateLine(toJSON(data).request));
		logLine(runTestWithChanges(isInteractiveSession));
		testDefinitionPromise = fetchTestDefinitions(appId, versionId, testId, isInteractiveSession);
	};

	const after = async(res, data) => {
		const testDefinitionsById = await testDefinitionPromise;

		getSnippetLogs({
			testId: data.testId,
			definitions: testDefinitionsById,
			results: res.results,
			withChanges: isInteractiveSession,
			level: 1,
			translateResult: translateLineResult,
		}).forEach(logLine);
		logLine(runTestEnd(data.testId));
		processServerResponse(toString)(res, data);
	};

	return makeThenComposer(toJSON, after, before)(...args);
};

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
	testId: validate(validators.NON_EMPTY_STRING, testId, invalidInputMessage(chainName, 'Test ID')),
});

module.exports = {
	runTestAssert: testId => runTestChain(testId).toAssert(),

	// For testing
	runTest: runTestChain,
	toJSON,
	getSnippetLogs,
	fetchTestDefinitions,
};
