const {isNil} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');

// Import chain composers
const {
	notComposer,
	existComposer,
	matchComposer,
	matchRepoComposer,
	matchJSComposer,
	// matchBrightScriptComposer,
	timeoutComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
	isPlayingComposer,
	isStoppedComposer,
	isPausedComposer,
	visibleComposer,
} = require('../composers');
const {
	element,
	elementExist,
	elementNotExist,
	elementVisible,
	elementMatchProps,
	elementMatchJS,
	elementNotMatchJS,
	elementMatchBRS,
	elementNotMatchBRS,
} = require('../texts');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {
	processServerResponse,
	getRequestType,
	applyTimeout,
	applyNegation,
} = require('../utils/socketChainHelper');
const {
	SUBJ_COMPARATOR: SUBJ_COMPARATOR_M,
	VALUE: VALUE_M,
} = require('../mappings');
const {VALUE} = require('../constants/element');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;
const {placeholdEmpty} = require('../utils/stringUtils');

/**
 * Returns human readable description of the video chain.
 * @param data - chain data
 * @param nameOnly - if true only element name will be returned (like: {"apiId" : "boo"})
 * @returns {*}
 */
const toString = (data, nameOnly = false) => {
	const elName = 'video';

	if (nameOnly)
		return elName;

	let out = element(elName);

	if (data.comparator) {
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
	}

	return out;
};
const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};
	const subject = {
		type: 'video',
	};

	// query
	if (type === 'query') {
		socketMessage.subject = {
			type: 'elementProps',
			selector: {video: true},
		};
	}

	// video subject
	if (data.comparator) {
		socketMessage.request = applyTimeout({
			type: 'assert',
			condition: {subject},
		}, data);

		socketMessage.request.condition.type = applyNegation(data.comparator.type, data);

		// match js
		if (data.comparator.type === SUBJ_COMPARATOR.MATCH_JS) {
			socketMessage.request.condition.val = data.comparator.val;
		}
		// match bs
		if (data.comparator.type === SUBJ_COMPARATOR.MATCH_BRS) {
			socketMessage.request.condition.val = data.comparator.val;
		}
		// match props
		if (data.comparator.type === SUBJ_COMPARATOR.MATCH) {
			socketMessage.request.condition.expression = data.comparator.props.map(prop => {
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
	}

	return socketMessage;
};

// Build Composers
const toStringComposer = makeToStringComposer(toString);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString), beforeSendMsg);
const toJSONComposer = makeToJSONComposer(toJSON);

/**
 * Function accepts data object of future chain as input
 * and returns a list of composers that should build the chain
 * @param data
 * @returns {*[]}
 */
const getComposers = (data) => {
	const output = [
		toStringComposer,
		thenComposer,
		cloneComposer,
		gettersComposer,
		toJSONComposer,
	];

	const comparatorType = data.comparator && data.comparator.type;
	const isMatchesComparator = comparatorType === SUBJ_COMPARATOR_M.MATCH
		|| comparatorType === SUBJ_COMPARATOR_M.MATCH_JS
		|| comparatorType === SUBJ_COMPARATOR_M.MATCH_BRS;

	const isVisibleComparator = comparatorType === SUBJ_COMPARATOR_M.VISIBLE;

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isNegated && !isMatchesComparator && !isVisibleComparator) {
		output.push(notComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.timeout) {
		output.push(timeoutComposer);
	}

	if (!data.comparator) {
		output.push(existComposer);
		if (!data.isNegated) {
			output.push(
				visibleComposer, matchComposer, matchRepoComposer, matchJSComposer,
				// matchBrightScriptComposer
			);
		}
	}

	if (!data.comparator && !data.isNegated) {
		output.push(
			isPlayingComposer,
			isStoppedComposer,
			isPausedComposer
		);
	}

	return output;
};

const videoChain = () => {
	return makeChain(getComposers, {
		type: 'element',
		selector: {video: true},
	});
};

module.exports = {
	video: videoChain,
	videoAssert: () => videoChain().toAssert(),

	// For testing
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
};
