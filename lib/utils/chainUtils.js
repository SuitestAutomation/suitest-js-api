// TODO: create UT for current file.

const {isNil, path, compose} = require('ramda');
const {placeholdEmpty} = require('./stringUtils');
const {VALUE} = require('../constants/element');
const {
	elementExist,
	elementNotExist,
	elementVisible,
	elementMatchProps,
	elementMatchJS,
	elementNotMatchJS,
	elementMatchBRS,
	elementNotMatchBRS,
} = require('../texts');

const {
	VALUE: VALUE_M,
} = require('../mappings');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {config} = require('../../config');

/**
 * @description get human readable command subject part
 * @param {Object} def - json definition of command line
 * @param {string} elName
 * @returns {string}
 */
const elementWithConditionToString = (def, elName) => {
	let out = '';
	const isNegated = isDefNegated(def);
	const comparatorType = getPureComparatorType(def);

	switch (comparatorType) {
		case SUBJ_COMPARATOR.VISIBLE:
			out = elementVisible(elName);
			break;
		case SUBJ_COMPARATOR.EXIST:
			out = (isNegated ? elementNotExist : elementExist)(elName);
			break;
		case SUBJ_COMPARATOR.MATCH_JS:
			out = (isNegated ? elementNotMatchJS : elementMatchJS)(elName, def.condition.val);
			break;
		case SUBJ_COMPARATOR.MATCH_BRS:
			out = (isNegated ? elementNotMatchBRS : elementMatchBRS)(elName, def.condition.val);
			break;
		default: {
			const matches = def.condition.expression.map(
				one => `  ${one.property} ${one.type} ${placeholdEmpty(one.inherited ? VALUE_M[VALUE.REPO] : one.val)}`
			);

			out = elementMatchProps(elName, '\n' + matches.join(',\n'));
		}
	}

	return out;
};

const elementWithComparatorToJSON = (data, subject) => {
	const request = applyTimeout({
		type: 'assert',
		condition: {subject},
	}, data);

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
	return jsonMessage.type !== 'query' && 'request' in jsonMessage
		? jsonMessage.request
		: jsonMessage;
}

const DEFAULT_COUNT = 1;
const DEFAULT_DELAY = 1;

/**
 * Apply count and delay to socketMessage
 * @param {Object} socketMessage
 * @param {Object} data
 * @return {Object} socketMessage
 */
const applyCountAndDelay = (socketMessage, data) => {
	socketMessage.count = 'repeat' in data ? data.repeat : DEFAULT_COUNT;
	socketMessage.delay = 'interval' in data ? data.interval : DEFAULT_DELAY;

	return socketMessage;
};

/**
 * @description Apply default clicks array
 * @param {Object} socketMessage
 */
const applyClicks = (socketMessage) => {
	socketMessage.clicks = [{
		type: 'single',
		button: 'left',
	}];

	return socketMessage;
};

/**
 * @description pipeline function which compose applyClicks and applyCountAndDelay
 * @param {Object} socketMessage
 * @param {Object} data
 */
const applyCountAndDelayAndClicks = (socketMessage, data) => {
	return compose(
		msg => applyCountAndDelay(msg, data),
		applyClicks
	)(socketMessage);
};

/**
 * Get timeout for assert based on chain data
 * @param data
 * @returns {number}
 */
const getTimeoutValue = data =>
	Number.isFinite(data.timeout) && data.timeout >= 0 ? data.timeout : config.defaultTimeout;

/**
 * Apply timeout to condition socketMessage
 * @param {Object} socketMessage
 * @param {Object} data
 * @return {Object} socketMessage
 */
const applyTimeout = (socketMessage, data) => {
	const timeout = getTimeoutValue(data);

	if (timeout > 0) {
		socketMessage.timeout = timeout;
		socketMessage.type = 'wait';
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

module.exports = {
	elementWithConditionToString,
	elementWithComparatorToJSON,
	getMatchExpression,
	isDefNegated,
	getPureComparatorType,
	processJsonMessageForToString,
	applyClicks,
	applyCountAndDelay,
	applyCountAndDelayAndClicks,
	applyNegation,
	applyUntilCondition,
	applyTimeout,
	getTimeoutValue,
};
