const {compose, isNil} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {processJsonMessageForToString, applyCountAndDelay, applyUntilCondition} = require('../utils/chainUtils');
const {
	processServerResponse,
	getRequestType,
} = require('../utils/socketChainHelper');

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
const {
	chainRepeat,
	windowDefault,
	windowSendText,
	refresh,
	setSize,
	goBack,
	goForward,
	dismissModal,
	acceptModal,
	acceptModalWithText,
} = require('../texts');
const logger = require('../utils/logger');
const getOpType = require('../utils/opType').getOpType;

const oneOfPropsList = [
	'sendText', 'isRefresh', 'isGoBack', 'isGoForward',
	'isSetSize', 'isDismissModal', 'isAcceptModal',
];

const windowFactory = (classInstance) => {
	const toString = (jsonMessage) => {
		const jsonDef = processJsonMessageForToString(jsonMessage);

		if (jsonDef.type === 'sendText') {
			return windowSendText(jsonDef.val) + chainRepeat(jsonDef.count, jsonDef.delay);
		}

		switch (jsonDef.browserCommand.type) {
			case 'refresh':
				return refresh();
			case 'goBack':
				return goBack();
			case 'goForward':
				return goForward();
			case 'setWindowSize':
				return setSize(jsonDef.browserCommand.params.width, jsonDef.browserCommand.params.height);
			case 'dismissAlertMessage':
				return dismissModal();
			case 'acceptAlertMessage':
				return acceptModal();
			case 'acceptPromptMessage':
				return acceptModalWithText(jsonDef.browserCommand.params.text);
			default:
				return windowDefault();
		}
	};

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
	const beforeSendMsg = (data) => logger.log(
		getOpType(data),
		compose(toString, toJSON)(data),
	);

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
	const toStringComposer = makeToStringComposer(toString, toJSON);
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

		if (!oneOfPropsList.some(flag => flag in data)) {
			output.push(
				goBackComposer, goForwardComposer, refreshComposer, setSizeComposer,
				dismissModalComposer, acceptModalComposer, sendTextComposer
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
		beforeSendMsg,
	};
};

module.exports = windowFactory;
