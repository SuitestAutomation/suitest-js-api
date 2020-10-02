// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	applyTimeout,
	applyNegation,
} = require('../utils/chainUtils');
const {
	notComposer,
	abandonComposer,
	makeToStringComposer,
	makeThenComposer,
	startWithComposer,
	endWithComposer,
	containComposer,
	equalComposer,
	matchJSComposer,
	existComposer,
	timeoutComposer,
	cloneComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
} = require('../composers');
const {
	invalidInputMessage,
} = require('../texts');
const {
	getRequestType,
} = require('../utils/socketChainHelper');
const {validate, validators} = require('../validation');

const cookieFactory = (classInstance) => {
	const toJSON = data => {
		const type = getRequestType(data);
		const subject = {type: 'cookie'};
		const socketMessage = {type};

		if (data.cookieName) {
			subject[type === 'query' ? 'cookieName' : 'val'] = data.cookieName;
		}

		if (type === 'query') {
			socketMessage.subject = subject;
		} else {
			socketMessage.request = Object.assign(
				socketMessage.request || {},
				applyTimeout({
					type: 'assert',
					condition: {subject},
				}, data, classInstance.config.defaultTimeout),
			);

			if (data.comparator) {
				socketMessage.request.condition.type = applyNegation(data.comparator.type, data);
				socketMessage.request.condition.val = data.comparator.val;
			}
		}

		return socketMessage;
	};

	// Build Composers
	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer(toJSON);

	/**
	 * Function accepts data object of future chain as input
	 * and returns a list of composers that should build the chain
	 * @param data
	 * @returns {*[]}
	 */
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

		if (!data.isNegated) {
			output.push(notComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.timeout) {
			output.push(timeoutComposer);
		}

		if (!data.comparator) {
			output.push(
				startWithComposer, endWithComposer, containComposer, equalComposer, matchJSComposer, existComposer
			);
		}

		return output;
	};

	// Chain builder functions
	const cookieChain = cookieName => {
		return makeChain(classInstance, getComposers, {
			type: 'cookie',
			cookieName: validate(validators.NON_EMPTY_STRING, cookieName, invalidInputMessage('cookie', 'Cookie name')),
		});
	};

	return {
		cookie: cookieChain,
		cookieAssert: cookieName => cookieChain(cookieName).toAssert(),

		// For Unit tests
		getComposers,
		toJSON,
	};
};

module.exports = cookieFactory;
