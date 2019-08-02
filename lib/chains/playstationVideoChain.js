// Import utils
const makeChain = require('../utils/makeChain');

// Import chain composers
const {
	matchComposer,
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
} = require('../composers');
const {
	element,
	elementMatchProps,
	psVideoChainName,
} = require('../texts');
const {
	processServerResponse,
	getRequestType,
	applyTimeout,
	applyNegation,
} = require('../utils/socketChainHelper');
const {VALUE: VALUE_M} = require('../mappings');
const logger = require('../utils/logger');
const {getMatchExpression} = require('./elementChain');
const getOpType = require('../utils/opType').getOpType;
const {placeholdEmpty} = require('../utils/stringUtils');

/**
 * Returns human readable description of the native video chain.
 * @param data - chain data
 * @param nameOnly - if true only element name will be returned
 * @returns {string}
 */
const toString = (data, nameOnly = false) => {
	const elName = psVideoChainName();

	if (nameOnly)
		return elName;

	let out = element(elName);

	if (data.comparator) {
		const matches = data.comparator.props.map(
			one => `  ${one.name} ${one.type} ${placeholdEmpty(VALUE_M[one.val] || one.val)}`
		);

		out = elementMatchProps(elName, '\n' + matches.join(',\n'));
	}

	return out;
};

const beforeSendMsg = (data) => logger.log(getOpType(data), toString(data));

const toJSON = data => {
	const type = getRequestType(data);
	const socketMessage = {type};
	const subject = {
		type: 'element',
	};

	subject.val = data.selector;

	// query
	if (type === 'query') {
		socketMessage.subject = {
			type: 'elementProps',
			selector: data.selector,
		};
	}

	// element subject
	if (data.comparator) {
		socketMessage.request = applyTimeout({
			type: 'assert',
			condition: {subject},
		}, data);

		socketMessage.request.condition.type = applyNegation(data.comparator.type, data);

		// match props
		socketMessage.request.condition.expression = getMatchExpression(data);
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

	if (!data.isAssert) {
		output.push(assertComposer);
	}

	if (!data.isAbandoned) {
		output.push(abandonComposer);
	}

	if (!data.timeout) {
		output.push(timeoutComposer);
	}

	if (!data.comparator) {
		output.push(
			matchComposer,
			isPlayingComposer,
			isStoppedComposer,
			isPausedComposer
		);
	}

	return output;
};

const playstationVideoChain = () => {
	const selector = {psVideo: true};

	return makeChain(getComposers, {
		type: 'element',
		selector,
	});
};

module.exports = {
	playstationVideo: playstationVideoChain,
	playstationVideoAssert: () => playstationVideoChain().toAssert(),
};
