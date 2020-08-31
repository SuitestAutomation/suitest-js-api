// Import utils
const makeChain = require('../utils/makeChain');
const {
	makeThenComposer,
	makeToStringComposer,
	abandonComposer,
	cloneComposer,
	gettersComposer,
	assertComposer,
	makeToJSONComposer,
} = require('../composers');
const {processServerResponse} = require('../utils/socketChainHelper');
const {clearAppData} = require('../texts');
const getOpType = require('../utils/opType').getOpType;

const clearAppDataFactory = (classInstance) => {
	const {logger} = classInstance;
	const toString = () => clearAppData();
	const beforeSendMsg = (data) => logger.log(getOpType(data), toString());

	const toJSON = () => ({
		type: 'eval',
		request: {
			type: 'clearAppData',
		},
	});

	const toStringComposer = makeToStringComposer(toString);
	const thenComposer = makeThenComposer(toJSON, processServerResponse(logger, toString), beforeSendMsg);
	const toJSONComposer = makeToJSONComposer({toJSON});

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

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		return output;
	};

	const clearAppDataChain = () => makeChain(classInstance, getComposers, {type: 'clearAppData'});

	return {
		clearAppData: clearAppDataChain,
		clearAppDataAssert: () => clearAppDataChain().toAssert(),

		// For Unit tests
		getComposers,
		toString,
		toJSON,
		beforeSendMsg,
	};
};

module.exports = clearAppDataFactory;
