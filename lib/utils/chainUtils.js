const {isNil} = require('ramda');
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
		request.condition.expression = data.comparator.props.map(prop => {
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

	return request;
};

module.exports = {
	elementWithComparatorToString,
	elementWithComparatorToJSON,
};
