// TODO: create UT for current file.

const endpoints = require('../api/endpoints');
const request = require('../api/request');
const text = require('@suitest/smst-to-text');
// import from translateResults to have it as {[key]: [Function]} unlike direct import it is {[key]: [Getter]}
// getter cannot be mocked by sinon
const translate = require('../../lib/utils/translateResults');
const {getRequestOpType} = require('./opType');

const texts = require('../texts');
const SuitestError = require('./SuitestError');
const {isNil, path, compose, uniq} = require('ramda');
const {VALUE} = require('../constants/element');
const {SUBJ_COMPARATOR} = require('../constants/comparator');

/**
 * @param data
 * @param subject
 * @param [defaultTimeout]
 * @return {Object}
 */
const elementWithComparatorToJSON = (data, subject, defaultTimeout) => {
	const request = applyTimeout({
		type: 'assert',
		condition: {subject},
	}, data, defaultTimeout);

	request.condition.type = applyNegation(data.comparator.type, data);

	// match js
	if (data.comparator.type === SUBJ_COMPARATOR.MATCH_JS) {
		request.condition.val = data.comparator.val;
	}
	// match bs
	if (data.comparator.type === SUBJ_COMPARATOR.MATCH_BRS) {
		request.condition.val = data.comparator.val;
	}
	// match props
	if (data.comparator.type === SUBJ_COMPARATOR.MATCH) {
		request.condition.expression = getMatchExpression(data);
	}

	return request;
};

function getMatchExpression(data) {
	return data.comparator.props.map(prop => {
		const out = {
			property: prop.name,
			type: prop.type,
		};

		if (prop.val === VALUE.REPO) {
			out.inherited = true;
		} else {
			out.val = prop.val;
		}

		if (!isNil(prop.deviation)) {
			out.deviation = prop.deviation;
		}

		return out;
	});
}

/**
 * @description check that line definition condition is negated
 * @param {Object} def
 * @returns {boolean}
 */
function isDefNegated(def) {
	return (path(['condition', 'type'], def) || '').startsWith('!');
}

/**
 * @description get comparator type without negate "!" prefix
 * @param {Object} def
 * @returns {undefined|string}
 */
function getPureComparatorType(def) {
	const comparatorType = path(['condition', 'type'], def);

	if (!comparatorType) {
		return undefined;
	}

	return isDefNegated(def) ? comparatorType.slice(1) : comparatorType;
}

/**
 * @description process received json message to toString methods
 * json message can have 'query', 'eval', 'testLine' type.
 * In case of 'eval', 'testLine', command json representation will be in 'request' property
 * @param {Object} jsonMessage
 * @returns {Object}
 */
function processJsonMessageForToString(jsonMessage) {
	return !['query', 'takeScreenshot'].includes(jsonMessage.type) && 'request' in jsonMessage
		? jsonMessage.request
		: jsonMessage;
}

const DEFAULT_COUNT = 1;
const DEFAULT_DELAY = 1;

const applyCount = (socketMessage, data) => {
	socketMessage.count = 'repeat' in data ? data.repeat : DEFAULT_COUNT;

	return socketMessage;
};

const applyDelay = (socketMessage, data) => {
	socketMessage.delay = 'interval' in data ? data.interval : DEFAULT_DELAY;

	return socketMessage;
};

/**
 * Apply count and delay to socketMessage
 * @param {Object} socketMessage
 * @param {Object} data
 * @return {Object} socketMessage
 */
const applyCountAndDelay = (socketMessage, data) => applyDelay(applyCount(socketMessage, data), data);

/**
 * @description Apply actions
 * @param {Object} socketMessage
 * @param {data} data
 */
const applyActions = (socketMessage, data) => {
	if (data.tap) {
		socketMessage.taps = [{
			type: data.tap,
			...(data.tapDuration ? {duration: data.tapDuration} : {}),
		}];
	} else if (data.isClick) {
		socketMessage.clicks = [{
			type: 'single',
			button: 'left',
		}];
	} else if (data.isScroll) {
		socketMessage.scroll = [{
			direction: data.direction,
			distance: data.distance,
		}];
	} else if (data.isSwipe) {
		socketMessage.swipe = [{
			direction: data.direction,
			distance: data.distance,
			duration: data.duration,
		}];
	}

	return socketMessage;
};

/**
 * @description pipeline function which compose applyActions and applyCountAndDelay
 * @param {Object} socketMessage
 * @param {Object} data
 */
const applyCountAndDelayAndActions = (socketMessage, data) => {
	return compose(
		msg => applyCountAndDelay(msg, data),
		msg => applyActions(msg, data),
	)(socketMessage);
};

/**
 * Get timeout for assert based on chain data
 * @param data
 * @param defaultTimeout
 * @returns {number | string}
 */
const getTimeoutValue = (data, defaultTimeout) => {
	if (typeof data.timeout === 'string') {
		return data.timeout;
	}

	return Number.isFinite(data.timeout) && data.timeout >= 0 ? data.timeout : defaultTimeout;
};

/**
 * Apply timeout to condition socketMessage
 * @param {Object} socketMessage
 * @param {Object} data
 * @param {Number} defaultTimeout
 * @return {Object} socketMessage
 */
const applyTimeout = (socketMessage, data, defaultTimeout) => {
	const timeout = getTimeoutValue(data, defaultTimeout);

	if (timeout > 0 || typeof timeout === 'string') {
		socketMessage.timeout = timeout;
		socketMessage.type = 'assert';
	}

	return socketMessage;
};

/**
 * Apply negation to comparator string
 * @param {String} comparator
 * @param {Object} data
 * @return {String} condition
 */
const applyNegation = (comparator, data) => {
	return data.isNegated ? ('!' + comparator) : comparator;
};

/**
 * Apply condition to socket message based on until composer chain
 * @param {Object} socketMessage
 * @param {Object} data
 * @return {Object} socketMessage
 */
const applyUntilCondition = (socketMessage, data) => {
	if (data.until) {
		return {
			...socketMessage,
			condition: data.until,
		};
	}

	return socketMessage;
};

const mapLogLevelsToTranslationModule = {
	silent: 'quite', // left for consistency but it's not used
	normal: 'quite',
	verbose: 'normal',
	debug: 'normal',
	silly: 'verbose',
};
/**
 * Use translation module to translate strings
 * @param json
 * @param logLevel
 */
const translateLine = (json, logLevel) => {
	if (logLevel === 'silent') {
		// no progress messages
		return '';
	}
	const testLine = processJsonMessageForToString(json);
	const line = text.toText(
		translate.translateTestLine({testLine}),
		{format: true, verbosity: mapLogLevelsToTranslationModule[logLevel]});
	const prefix = getRequestOpType(json);

	return `${prefix}${line}`;
};

const translateLineResult = (json, logLevel, lineResult) => {
	const testLine = processJsonMessageForToString(json);
	let verbosity = mapLogLevelsToTranslationModule[logLevel];

	if (json.type !== 'runSnippet' && lineResult && lineResult.result !== 'success') {
		verbosity = verbosity === 'quite' ? 'normal' : verbosity;
	}

	return text.toText(
		translate.translateTestLineResult({testLine, lineResult}),
		{format: true, verbosity},
	);
};

/**
 * Fetch test definitions recursively for all snippet lines
 * @param {Object} suitest
 * @return {function} fetchTestDefinitions function
 */

const fetchTestDefinitions = ({authContext}) => async(appId, versionId, mainTestId, includeChangelist, stack) => {
	const authedRequestObject = await authContext.authorizeHttp(
		endpoints.appTestDefinitionById,
		{method: 'GET'},
		{commandName: 'runTest'},
	);

	const testDefinitionsById = {};

	const fetchSingleTest = async(testId) => {
		const {definition} = await request(
			[
				`${endpoints.appTestDefinitionById}?includeChangelist=${includeChangelist}`,
				{appId, versionId, testId},
			],
			authedRequestObject,
			() => {
				const err = new SuitestError(texts['errorType.testCannotBeFetched'](
					testId, testId === mainTestId ? undefined : mainTestId,
				), SuitestError.INVALID_INPUT);

				err.stack = stack;
				throw err;
			},
		);

		testDefinitionsById[testId] = definition;

		const snippetsToFetch = uniq(
			definition
				.filter(line => line.type === 'runSnippet'
					&& line.val
					&& !line.excluded
					&& !Reflect.has(testDefinitionsById, line.val),
				)
				.map(line => line.val),
		);

		await Promise.all(snippetsToFetch.map(fetchSingleTest));
	};

	await fetchSingleTest(mainTestId);

	return testDefinitionsById;
};

module.exports = {
	elementWithComparatorToJSON,
	getMatchExpression,
	isDefNegated,
	getPureComparatorType,
	applyCount,
	applyActions,
	applyCountAndDelay,
	applyCountAndDelayAndActions,
	applyNegation,
	applyUntilCondition,
	applyTimeout,
	getTimeoutValue,
	mapLogLevelsToTranslationModule,
	translateLine,
	translateLineResult,
	fetchTestDefinitions,
};
