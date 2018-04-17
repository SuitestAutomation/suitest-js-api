const {compose} = require('ramda');

// Import utils
const makeChain = require('../utils/makeChain');
const {
	processServerResponse,
	getRequestType,
	applyCountAndDelay,
	applyUntilCondition,
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

const oneOfPropsList = [
	'sendText', 'isRefresh', 'isGoBack', 'isGoForward',
	'isSetSize', 'isDismissModal', 'isAcceptModal',
];

const toString = data => {
	if (data.sendText) {
		return data.repeat
			? windowSendText(data.sendText) + chainRepeat(data.repeat, data.interval)
			: windowSendText(data.sendText);
	} else if (data.isRefresh) {
		return refresh();
	} else if (data.isGoBack) {
		return goBack();
	} else if (data.isGoForward) {
		return goForward();
	} else if (data.isSetSize) {
		return setSize(data.width, data.height);
	} else if (data.isDismissModal) {
		return dismissModal();
	} else if (data.isAcceptModal) {
		return data.acceptModalMessage ? acceptModalWithText(data.acceptModalMessage) : acceptModal();
	}

	return windowDefault();
};

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
	if (data.dismissModal) {
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
	const lineType = data.sendText ? 'sendText' : 'browserCommand';
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
const toStringComposer = makeToStringComposer(toString);
const thenComposer = makeThenComposer(toJSON, processServerResponse(toString));
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

	if (data.sendText) {
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
	return makeChain(getComposers, {type: 'window'});
};

module.exports = {
	window: windowChain,
	windowAssert: () => windowChain().toAssert(),

	// For testing
	toJSON,
};
