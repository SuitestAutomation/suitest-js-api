const {compose, isNil} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {applyCountAndDelay, applyUntilCondition} = require('../utils/chainUtils');
const {getRequestType} = require('../utils/socketChainHelper');

// Import chain composers
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	gettersComposer,
	assertComposer,
	sendTextComposer,
	repeatComposer,
	intervalComposer,
	goBackComposer,
	goForwardComposer,
	refreshComposer,
	setSizeComposer,
	dismissModalComposer,
	acceptModalComposer,
	makeToJSONComposer,
	untilComposer,
} = require('../composers');

const oneOfPropsList = [
	'sendText', 'isRefresh', 'isGoBack', 'isGoForward',
	'isSetSize', 'isDismissModal', 'isAcceptModal',
];

const windowFactory = (classInstance) => {
	/**
	 * @description get browser command type basing on internal chain data
	 * @param data
	 * @returns {'refresh' | 'goBack' | 'goForward' | 'setWindowSize' | 'dismissAlertMessage' | 'acceptPromptMessage' | 'acceptAlertMessage'}
	 */
	const getBrowserCommandType = data => {
		if (data.isRefresh) {
			return 'refresh';
		}
		if (data.isGoBack) {
			return 'goBack';
		}
		if (data.isGoForward) {
			return 'goForward';
		}
		if (data.isSetSize) {
			return 'setWindowSize';
		}
		if (data.isDismissModal) {
			return 'dismissAlertMessage';
		}
		if (data.isAcceptModal && data.acceptModalMessage) {
			return 'acceptPromptMessage';
		}
		if (data.isAcceptModal && !data.acceptModalMessage) {
			return 'acceptAlertMessage';
		}
	};

	const toJSON = (data) => {
		const lineType = !isNil(data.sendText) ? 'sendText' : 'browserCommand';
		const socketMessage = {
			type: getRequestType(data, false),
			request: {type: lineType},
		};

		if (lineType === 'browserCommand') {
			socketMessage.request = {
				...socketMessage.request,
				browserCommand: {type: getBrowserCommandType(data)},
			};
			if (data.isSetSize) {
				socketMessage.request.browserCommand.params = {
					width: data.width,
					height: data.height,
				};
			}
			if (data.isAcceptModal && data.acceptModalMessage) {
				socketMessage.request.browserCommand.params = {
					text: data.acceptModalMessage,
				};
			}
		}

		if (lineType === 'sendText') {
			socketMessage.request = compose(
				msg => applyUntilCondition(msg, data),
				msg => applyCountAndDelay(msg, data),
			)({
				...socketMessage.request,
				target: {type: 'window'},
				val: data.sendText,
			});
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

		if (!oneOfPropsList.some(flag => flag in data)) {
			output.push(
				goBackComposer, goForwardComposer, refreshComposer, setSizeComposer,
				dismissModalComposer, acceptModalComposer, sendTextComposer,
			);
		}

		if (!isNil(data.sendText)) {
			if (!data.interval) {
				output.push(intervalComposer);
			}

			if (!data.repeat) {
				output.push(repeatComposer);
			}

			if (!data.until) {
				output.push(untilComposer);
			}
		}

		return output;
	};

	const windowChain = () => {
		return makeChain(classInstance, getComposers, {type: 'window'});
	};

	return {
		window: windowChain,
		windowAssert: () => windowChain().toAssert(),

		// For testing
		toJSON,
	};
};

module.exports = windowFactory;
