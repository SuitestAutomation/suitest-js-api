/* eslint-disable max-len */

const {EOL} = require('os');
const {path} = require('ramda');
const colors = require('colors');
const util = require('util');

const t = require('../texts');
const {arrToString, appendDot, stripAnsiChars} = require('./stringUtils');
const {getFirstStackLine} = require('./stackTraceParser');
const {NETWORK_PROP} = require('../mappings');

/** Description of the function
 * @name ChainToStringFunc
 * @function
 * @param {*} chainData chain data
 * @returns {string}
*/

/** Error map handler
 * @name ErrorMapHandler
 * @function
 * @param {*} [chainData] chain data object
 * @param {ChainToStringFunc} [toString] chain toString function which accept chainData and return human readable representation
 * @param {*} [response] webscoket message
 * @returns {string}
*/

const responseMessageCode = response => path(['message', 'code'], response);
const responseMessageInfo = response => path(['message', 'info'], response);

const videoAdapterErrors = ['videoAdapterInvalidOutput', 'videoAdapterNotFunction', 'videoAdapterThrownError'];
const excludeExpectedValues = ['internalError', 'queryTimeout'];
const jsExpressionErrorType = 'jsExpressionError';

/**
 * @description get default error message
 * @param {*} chainData chain data object
 * @param {ChainToStringFunc} toString chain toString function which accept chainData and return human readable representation
 * @param {*} response webscoket message
 * @returns {string}
 */
function defaultMessage({chainData, toString, response}) {
	const errors = (response.errors && chainData.type !== 'networkRequest')
		? `${EOL}errors: ${JSON.stringify(response.errors)}`
		: '';
	const errorType = normalizeErrorType(response);

	if (errorType)
		return `${errorType}: "${toString(chainData)}"${errors}`;
	else if (response.error)
		return `${response.error}${errors}`;

	const inspectOpt = {depth: 5, compact: true, breakLength: Infinity};

	return t.unknownServerError(
		util.inspect(chainData, inspectOpt),
		util.inspect(response, inspectOpt)
	);
}

/**
 * @description Create human readable error message from suitest error response
 * @param {Object.<string, ErrorMapHandler>} [errorMap]
 * @param {*} chainData chain data object
 * @param {ChainToStringFunc} toString chain toString function which accept chainData and return human readable representation
 * @param {*} response webscoket message
 * @returns {string}
 */
function getErrorMessage({errorMap, chainData, toString, response}) {
	response.errorType = normalizeErrorType(response);
	const payload = {
		chainData,
		toString: (data, nameOnly) => {
			const str = toString(data, nameOnly);

			return nameOnly? str : appendDot(str);
		},
		response,
	};
	let prefix = '';

	if (isErrorFatal(response))
		prefix = t['prefix.fatal']();
	else if (isWarning(response))
		prefix = t['prefix.warning']();

	return prefix
		+ (errorMap.hasOwnProperty(response.errorType)
			? errorMap[response.errorType](payload)
			: defaultMessage(payload))
		+ getActualExpectedValues(response, chainData);
}

function isWarning(response) {
	return response.result === 'warning';
}

/**
 * @description check if error should be considered as fatal
 * @param {Object} res websocket message
 * @returns {boolean}
 */
function isErrorFatal(res) {
	return res.result === 'fatal' || normalizeErrorType(res) === 'testIsNotStarted';
}

/**
 * @description Normalize errorType
 * @param {*} response webscoket message
 * @returns {string}
 */
function normalizeErrorType(response) {
	if (response.executeThrowException || response.matchJSThrowException) {
		return jsExpressionErrorType;
	}

	return response.errorType || response.executionError;
}

/**
 * @description return string for actual or expected log line
 * @param {string} str
 * @param {boolean} isActual
 * @returns {string}
 */
function valTemplate(str, isActual) {
	return colors[isActual ? 'red' : 'green'](
		`${isActual ? '×' : '~'} ${str} (${isActual ? 'actual' : 'expected'})`
	);
}

/**
 * @description creates array of actual/expected log lines based on response expression array
 * @param {Object} res
 * @param {Object} data
 * @returns {string[]}
 */
function getExpressionActualExpected(res, data) {
	const values = [];
	const isUntil = 'until' in data;
	const props = isUntil
		? path(['until', 'expression'], data)
		: path(['comparator', 'props'], data);

	// go through expression array
	for (let i = 0; i < res.expression.length; i++) {
		const expr = res.expression[i];
		const prop = props[i];
		const propName = isUntil ? prop.property : prop.name;

		expr.expectedValue !== undefined && values.push(valTemplate(`${propName}: ${expr.expectedValue}`, false));
		expr.actualValue !== undefined && values.push(valTemplate(`${propName}: ${expr.actualValue}`, true));
		expr.expectedValue !== undefined && expr.actualValue && values.push('');
	}

	return values;
}

/**
 * @description creates array of actual/expected log for networkRequest chain
 * @param {Object} res
 * @param {Object} data
 * @returns {string[]}
 */
function getNetworkActualExpected(res, data) {
	const values = [];
	const props = {
		request: path(['request', 'props'], data) || [],
		response: path(['response', 'props'], data) || [],
	};

	// go through errors array
	for (let i = 0; i < res.errors.length; i++) {
		const error = res.errors[i];
		let expected, actual, propName;

		if (error.type === 'noUriFound') {
			expected = path(['comparator', 'val'], data);
			actual = t['actualExpected.requestNotMade']();
			propName = 'url';
			values.push(valTemplate(`${propName}: ${expected}`, false));
			values.push(valTemplate(`${propName}: ${actual}`, true));
			continue;
		}

		const nameComparator = error.type === 'header' ? error.name : NETWORK_PROP['@' + error.type];
		const propsField = props[error.message].find(field => field.name === nameComparator);

		if (propsField) {
			expected = propsField.val;
			actual = 'actualValue' in error
				? error.actualValue
				: error.reason === 'notFound' ? t['actualExpected.notFound']() : t['actualExpected.unknown']();
			propName = `${error.message} ${error.type}` + (error.name ? ` "${error.name}"` : '');
			values.push(valTemplate(`${propName}: ${expected}`, false));
			values.push(valTemplate(`${propName}: ${actual}`, true));
		}
	}

	return values;
}

/**
 * @description return actualValue and expectedValue depended on server response
 * if response contain top level actualValue and expectedValue - they will be returned.
 * if response has expression array of element properties - all properties expected/actual values will be concatenated, for example:
 * { actualValue: 'height: 720\nwidth: 1282', expectedValue: 'height: 100\nwidth: 200' }
 * if response has errors and chain type is networkRequest - actual/expected values will be retreived from chainData/errors array.
 * @param {Object} res
 * @param {Object} data
 * @returns {string}
 */
function getActualExpectedValues(res, data) {
	const values = [];

	// don't display expected value for these error types:
	if (excludeExpectedValues.includes(normalizeErrorType(res))) {
		return '';
	}
	// check top level values, and return them, if they are present
	if (['actualValue', 'expectedValue'].some(prop => res.hasOwnProperty(prop))) {
		res.expectedValue !== undefined && values.push(valTemplate(res.expectedValue, false));
		res.actualValue !== undefined && values.push(valTemplate(res.actualValue, true));
		res.expectedValue !== undefined && res.actualValue && values.push('');
	}
	// check expression array
	else if (Array.isArray(res.expression)) {
		values.push(...getExpressionActualExpected(res, data));
	}
	// check networkRequest errors array
	else if (data.type === 'networkRequest' && Array.isArray(res.errors)) {
		values.push(...getNetworkActualExpected(res, data));
	}

	return values.length ? `${EOL}\t${t['actualExpected.failingChecks']()}${arrToString(values, true)}` : '';
}

/**
 * @type {Object.<string, ErrorMapHandler>}
 */
const errorMap = {
	failedStart: ({chainData, toString}) => {
		return toString(chainData);
	},
	missingApp: () => {
		return t['errorType.missingApp']();
	},
	outdatedLibrary: () => {
		return t['errorType.outdatedLibrary']();
	},
	initPlatformFailed: () => {
		return t['errorType.initPlatformFailed']();
	},
	packageNotFound: () => {
		return t['errorType.packageNotFound']();
	},
	missingPackage: () => {
		return errorMap.packageNotFound();
	},
	internalError: ({chainData, toString}) => {
		return t['errorType.internalError'](toString(chainData));
	},
	ILInternalError: ({chainData, toString}) => {
		return errorMap.internalError({
			chainData,
			toString,
		});
	},
	queryTimeout: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		if (code === 'missingILResponse') {
			const timeout = responseMessageInfo(response).timeout / 1000;

			return t['errorType.queryTimeout.missingILResponse'](timeout, timeout === 1 ? '' : 's', toString(chainData));
		}

		return t['errorType.queryTimeout'](toString(chainData));
	},
	serverError: ({chainData, toString}) => {
		return t['errorType.serverError'](toString(chainData));
	},
	invalidCredentials: () => {
		return t['errorType.invalidCredentials']();
	},
	syntaxError: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'WrongDelay':
				return t['errorType.syntaxError.WrongDelay'](toString(chainData));
			case 'wrongBody':
				return t['errorType.syntaxError.wrongBody'](toString(chainData));
			case 'wrongUrl':
				return t['errorType.syntaxError.wrongUrl'](toString(chainData));
			default:
				return t['errorType.syntaxError'](toString(chainData));
		}
	},
	invalidInput: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'lineTypeNotSupported':
				return t['errorType.invalidInput.lineTypeNotSupported'](toString(chainData));
			case 'elementNotSupported': {
				const modifier = [
					['isClick', '.click()'],
					['isMoveTo', '.move()'],
					['sendText', '.sendText()'],
					['setText', '.setText()'],
				].find(i => chainData.hasOwnProperty(i[0]))[1];

				return `${toString(chainData)} ${modifier} ${t['errorType.invalidInput.elementNotSupported']()}`;
			}
			default:
				return t['errorType.invalidInput'](toString(chainData));
		}
	},
	ActionNotAvailable: ({chainData, toString}) => {
		return t['errorType.ActionNotAvailable'](toString(chainData));
	},
	/**
	 * @description this error does not exists on BE
	 * needed for queryFailed or appRunning errors for press command
	 * @param chainData
	 * @param toString
	 * @returns {*}
	 */
	conditionNotSatisfied: ({chainData, toString}) => {
		return t['errorType.conditionNotSatisfied'](chainData.repeat, toString(chainData));
	},
	deviceError: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);
		const info = responseMessageInfo(response);
		let message;

		if (code === 'unsupportedSelector' && info.reason === 'xpathNotSupported') {
			message = t['errorType.deviceError.unsupportedSelector.xpathNotSupported']();
		} else if (code === 'deviceFailure' && info.reason === 'cssSelectorInvalid') {
			message = t['errorType.deviceError.deviceFailure.cssSelectorInvalid']();
		} else if (videoAdapterErrors.includes(code)) {
			message = t['errorType.videoAdapterError'](info.reason);
		} else {
			message = errorMap.internalError({
				chainData,
				toString,
			});
		}

		return message;
	},
	jsExpressionError: ({response}) => {
		return t['errorType.deviceError.jsExpression'](response.executeExceptionMessage || response.matchJSExceptionMessage);
	},
	// TODO: should be - The target device has opened application containing a wrong Suitest appId. Expected appId: {{ }}. Opened appId: {{ }}. Please double check that the Suitest code you have inserted in your application matches the code snippet inside {{link to the app configuration page}}.
	wrongApp: () => {
		return t['errorType.wrongApp']();
	},
	driverException: () => {
		return t['errorType.driverException']();
	},
	illegalButton: ({chainData, toString}) => {
		return t['errorType.illegalButton'](toString(chainData));
	},
	unsupportedButton: ({chainData, toString}) => {
		return errorMap.illegalButton({
			chainData,
			toString,
		});
	},
	aborted: ({chainData, toString, response}) => {
		if (path(['message', 'info', 'reason'], response) === 'manualActionRequired') {
			return t['errorType.aborted.manualActionRequired']();
		}

		return t['errorType.aborted'](toString(chainData));
	},
	queryFailed: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		if (chainData.type === 'press') {
			return errorMap.conditionNotSatisfied({
				chainData,
				toString,
			});
		}

		switch (code) {
			case 'invalidApp':
				return errorMap.wrongApp();
			case 'invalidUrl':
				return t['errorType.queryFailed.invalidUrl'](response.actualValue, response.expectedValue);
			case 'applicationError':
				return t['errorType.queryFailed.applicationError'](toString(chainData));
			case 'exprException':
				return t['errorType.queryFailed.exprException'](path(['message', 'info', 'exception'], response));
			case 'orderErr':
				return t['errorType.queryFailed.orderErr']();
			case 'updateAlert':
				return t['errorType.queryFailed.updateAlert']();
			case 'notFunction':
				return t['errorType.queryFailed.notFunction'](toString(chainData));
			case 'missingSubject':
				if (chainData.type === 'element')
					return t['errorType.NoSuchElement'](toString(chainData, true));
				break;
			default:
				break;
		}

		return defaultMessage({
			response,
			chainData,
			toString,
		});
	},
	networkError: ({chainData, toString}) => {
		return toString(chainData);
	},
	noHasLines: ({chainData, toString}) => {
		return t['errorType.noHasLines'](toString(chainData));
	},
	appCrashed: ({chainData, toString}) => {
		return t['errorType.appCrashed'](toString(chainData));
	},
	timeLimitExceeded: ({chainData, toString}) => {
		return t['errorType.timeLimitExceeded'](toString(chainData));
	},
	// TODO: should be - Device did not respond after [seconds] seconds.
	notResponding: () => {
		return t['errorType.notResponding']();
	},
	suitestifyError: () => {
		return t['errorType.suitestifyError']();
	},
	suitestifyRequired: () => {
		return t['errorType.suitestifyRequired']();
	},
	invalidVariable: ({response}) => {
		const variables = path(['args', 'variables'], response) || [];

		if (variables.length === 0) {
			return t['errorType.invalidVariable0']();
		}
		const varsLen = variables.length;

		return (varsLen === 1 ?
			t['errorType.invalidVariable1'] :
			t['errorType.invalidVariable2'])(variables.join(', '));
	},
	appRunning: ({chainData, toString}) => {
		if (chainData.type === 'press') {
			return errorMap.conditionNotSatisfied({
				chainData,
				toString,
			});
		}

		return t['errorType.appRunning']();
	},
	appNotRunning: () => {
		return t['errorType.appNotRunning']();
	},
	bootstrapPageNotDetected: () => {
		return t['errorType.bootstrapPageNotDetected']();
	},
	wrongAppDetected: () => {
		return t['errorType.wrongAppDetected']();
	},
	notExpectedResponse: ({chainData, toString}) => {
		return t['errorType.notExpectedResponse'](chainData.url, toString(chainData));
	},
	noConnection: ({chainData, toString}) => {
		return t['errorType.noConnection'](chainData.url, toString(chainData));
	},
	invalidResult: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'resultTooLong':
				return t['errorType.invalidResult.resultTooLong'](chainData.url, toString(chainData));
			default:
				break;
		}

		return t['errorType.invalidResult'](chainData.url, toString(chainData));
	},
	lateManualLaunch: () => {
		return t['errorType.lateManualLaunch']();
	},
	launchExpired: () => {
		return t['errorType.launchExpired']();
	},
	deviceIsBusy: () => {
		return errorMap.launchExpired();
	},
	notActiveDeveloperMode: () => {
		return t['errorType.notActiveDeveloperMode']();
	},
	invalidUrl: () => {
		return t['errorType.invalidUrl']();
	},
	invalidRepositoryReference: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);
		const apiId = path(['message', 'apiId'], response);

		switch (code) {
			case 'notExistingElement':
				return t['errorType.invalidRepositoryReference.notExistingElement'](apiId);
			case 'unknownProperty':
				return t['errorType.invalidRepositoryReference.unknownProperty'](apiId, path(['message', 'property'], response));
			case 'notExistingPlatform':
				return t['errorType.invalidRepositoryReference.notExistingPlatform'](apiId);
			default:
				break;
		}

		return toString(chainData);
	},
	// TODO: should be - An error occurred while executing the [Open app override test name]
	openAppOverrideFailed: () => {
		return t['errorType.openAppOverrideFailed']();
	},
	invalidOpenAppOverrideReference: () => {
		return t['errorType.invalidOpenAppOverrideReference']();
	},
	Success: () => {
		return t['errorType.Success']();
	},
	NoSuchElement: ({chainData, toString}) => {
		return t['errorType.NoSuchElement'](toString(chainData, true));
	},
	NoSuchFrame: ({chainData, toString}) => {
		return t['errorType.NoSuchFrame'](toString(chainData, true));
	},
	UnknownCommand: ({chainData, toString}) => {
		return t['errorType.UnknownCommand'](toString(chainData));
	},
	StaleElementReference: ({chainData, toString}) => {
		return t['errorType.StaleElementReference'](toString(chainData, true));
	},
	ElementNotVisible: ({chainData, toString}) => {
		return t['errorType.ElementNotVisible'](toString(chainData, true));
	},
	InvalidElementState: ({chainData, toString}) => {
		return t['errorType.InvalidElementState'](toString(chainData, true));
	},
	UnknownError: ({chainData, toString, response}) => {
		return defaultMessage({
			chainData,
			toString,
			response,
		});
	},
	ElementIsNotSelectable: ({chainData, toString}) => {
		return t['errorType.ElementIsNotSelectable'](toString(chainData, true));
	},
	JavaScriptError: ({chainData, toString}) => {
		return `An error occurred while executing user supplied JavaScript. ${toString(chainData)}`;
	},
	XPathLookupError: ({chainData, toString}) => {
		return t['errorType.XPathLookupError'](toString(chainData, true));
	},
	Timeout: ({chainData, toString}) => {
		return t['errorType.Timeout'](toString(chainData));
	},
	NoSuchWindow: ({chainData, toString}) => {
		return t['errorType.NoSuchWindow'](toString(chainData));
	},
	InvalidCookieDomain: ({chainData, toString}) => {
		return t['errorType.InvalidCookieDomain'](toString(chainData));
	},
	UnableToSetCookie: ({chainData, toString}) => {
		return t['errorType.UnableToSetCookie'](toString(chainData));
	},
	UnexpectedAlertOpen: ({chainData, toString}) => {
		return t['errorType.UnexpectedAlertOpen'](toString(chainData));
	},
	NoAlertOpenError: ({chainData, toString}) => {
		return t['errorType.NoAlertOpenError'](toString(chainData));
	},
	ScriptTimeout: ({chainData, toString}) => {
		return t['errorType.ScriptTimeout'](toString(chainData));
	},
	InvalidElementCoordinates: ({chainData, toString}) => {
		return t['errorType.InvalidElementCoordinates'](toString(chainData, true));
	},
	IMENotAvailable: () => {
		return t['errorType.IMENotAvailable']();
	},
	IMEEngineActivationFailed: () => {
		return t['errorType.IMEEngineActivationFailed']();
	},
	InvalidSelector: ({chainData, toString}) => {
		return t['errorType.InvalidSelector'](toString(chainData));
	},
	unknownWebDriverKey: () => {
		return t['errorType.unknownWebDriverKey']();
	},
	unfocusableElement: ({chainData, toString}) => {
		return t['errorType.unfocusableElement'](toString(chainData, true));
	},
	unclickableElement: ({chainData, toString}) => {
		return t['errorType.unclickableElement'](toString(chainData, true));
	},
	appiumInstanceError: () => {
		return t['errorType.appiumInstanceError']();
	},
	deviceConnectionError: () => {
		return t['errorType.deviceConnectionError']();
	},
	landingActivityTimeoutError: ({response}) => {
		const info = responseMessageInfo(response) || {};

		return t['errorType.landingActivityTimeoutError'](info.currentLandingActivity);
	},
	testIsNotStarted: () => {
		return t['errorType.testIsNotStarted']();
	},
	signInRequired: () => {
		return t['errorType.signInRequired']();
	},
	sessionInitializationError: () => {
		return t['errorType.sessionInitializationError']();
	},
	connectionNotAuthorized: () => {
		return t['errorType.connectionNotAuthorized']();
	},
	higherOSVersionRequired: () => {
		return t['errorType.higherOSVersionRequired']();
	},
	appleError65: () => t['errorType.appleError65'](),
	appleError70: () => t['errorType.appleError70'](),
	appleEconnresetError: () => t['errorType.appleEconnresetError'](),
	applePairingError: () => t['errorType.applePairingError'](),
	appleIosDeployError: () => t['errorType.appleIosDeployError'](),
	appleAppSignError: () => t['errorType.appleAppSignError'](),
};

Object.freeze(errorMap);

/**
 * @type {Object.<string, {translation: (function(): string), details: (function(): string)}>}
 */
const notStartedReasons = {
	'blasterError': {
		translation: t['notStartedReason.blasterError'](),
		details: t['notStartedReason.blasterErrorDesc'](),
	},
	'bootstrappedPlatformError': {
		translation: t['notStartedReason.bootstrappedPlatformError'](),
		details: t['notStartedReason.bootstrappedPlatformErrorDesc'](),
	},
	'testQueued': {
		translation: t['notStartedReason.testQueued'](),
		details: t['notStartedReason.testQueuedDesc'](),
	},
	'noAvailableMinutes': {
		translation: t['notStartedReason.noAvailableMinutes'](),
		details: t['notStartedReason.noAvailableMinutesDesc'](),
	},
	'noActivePlan': {
		translation: t['notStartedReason.noActivePlan'](),
		details: t['notStartedReason.noActivePlanDesc'](),
	},
	'candyBoxOffline': {
		translation: t['notStartedReason.candyBoxOffline'](),
		details: t['notStartedReason.candyBoxOfflineDesc'](),
	},
	'suitestDriveOffline': {
		translation: t['notStartedReason.suitestDriveOffline'](),
		details: t['notStartedReason.suitestDriveOfflineDesc'](),
	},
	'runningBootSequence': {
		translation: t['notStartedReason.runningBootSequence'](),
		details: t['notStartedReason.runningBootSequenceDesc'](),
	},
	'deviceInUse': {
		translation: t['notStartedReason.deviceInUse'](),
		details: t['notStartedReason.deviceInUseDesc'](),
	},
	'deviceDisabled': {
		translation: t['notStartedReason.deviceDisabled'](),
		details: t['notStartedReason.deviceDisabledDesc'](),
	},
	'deviceDeleted': {
		translation: t['notStartedReason.deviceDeleted'](),
		details: t['notStartedReason.deviceDeletedDesc'](),
	},
	'internalError': {
		translation: t['notStartedReason.internalError'](),
		details: t['notStartedReason.internalErrorDesc'](),
	},
	'notDefinedPlatform': {
		translation: t['notStartedReason.notDefinedPlatform'](),
		details: t['notStartedReason.notDefinedPlatformDesc'](),
	},
	'lgWebosPlatformError': {
		translation: t['notStartedReason.lgWebosPlatformError'](),
		details: t['notStartedReason.lgWebosPlatformErrorDesc'](),
	},
	'xboxPlatformError': {
		translation: t['notStartedReason.xboxPlatformError'](),
		details: t['notStartedReason.xboxPlatformErrorDesc'](),
	},
	'androidPlatformError': {
		translation: t['notStartedReason.androidPlatformError'](),
		details: t['notStartedReason.androidPlatformErrorDesc'](),
	},
};

Object.freeze(notStartedReasons);

module.exports = {
	/**
	 * @description Create human readable error message from suitest error response
	 * @param payload
	 * @param {Object.<string, ErrorMapHandler>} [payload.errorMap]
	 * @param {*} payload.chainData chain data object
	 * @param {ChainToStringFunc} payload.toString chain toString function which accept chainData and return human readable representation
	 * @param {{errorType: string}} payload.response webscoket message
	 * @returns {string}
	 */
	getErrorMessage: payload => getErrorMessage({
		errorMap,
		...payload,
	}),
	/**
	 * @description Create human readable error message for real time info logs
	 * @param {string} message
	 * @param {string} prefix
	 * @param {Object} res
	 * @param {string} [stack]
	 * @returns {string}
	 */
	getInfoErrorMessage: (message, prefix, res, stack) => {
		const suffix = isErrorFatal(res) ? ` ${t['suffix.sessionWillClose']()}` : '';
		const msg = prefix + stripAnsiChars(message) + suffix;
		const firstStackLine = stack && getFirstStackLine(stack);
		const nl = firstStackLine && msg.endsWith(EOL) ? '' : EOL;

		return msg + nl + firstStackLine;
	},
	errorMap,
	responseMessageCode,
	responseMessageInfo,
	normalizeErrorType,
	/**
	 * @param {string} reasonCode
	 * @returns {string}
	 */
	getNotStartedReasonMessage(reasonCode) {
		const reason = notStartedReasons[reasonCode];

		if (!reason) return '';

		return reason.details
			? `${reason.translation}.\n${reason.details}.`
			: reason.translation + '.';
	},
	notStartedReasons,
};
