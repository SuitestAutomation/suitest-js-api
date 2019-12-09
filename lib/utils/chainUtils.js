// TODO: create UT for current file.

const {isNil, path} = require('ramda');
const {applyTimeout, applyNegation} = require('./socketChainHelper');
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

/**
 * @deprecated use elementWithConditionToString for refactored toString functions
 * @param data
 * @param elName
 * @returns {*}
 */
const elementWithComparatorToString = (data, elName) => {
	let out = '';

	switch (data.comparator.type) {
		case SUBJ_COMPARATOR.VISIBLE:
			out = elementVisible(elName);
			break;
		case SUBJ_COMPARATOR.EXIST:
			out = (data.isNegated ? elementNotExist : elementExist)(elName);
			break;
		case SUBJ_COMPARATOR.MATCH_JS:
			out = (data.isNegated ? elementNotMatchJS : elementMatchJS)(elName, data.comparator.val);
			break;
		case SUBJ_COMPARATOR.MATCH_BRS:
			out = (data.isNegated ? elementNotMatchBRS : elementMatchBRS)(elName, data.comparator.val);
			break;
		default: {
			const matches = data.comparator.props.map(
				one => `  ${one.name} ${one.type} ${placeholdEmpty(VALUE_M[one.val] || one.val)}`
			);

			out = elementMatchProps(elName, '\n' + matches.join(',\n'));
		}
	}

	return out;
};

// TODO(SUIT-14046): should replace elementWithComparatorToString
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

module.exports = {
	elementWithComparatorToString,
	elementWithConditionToString,
	elementWithComparatorToJSON,
	getMatchExpression,
	isDefNegated,
	getPureComparatorType,
	processJsonMessageForToString,
};
