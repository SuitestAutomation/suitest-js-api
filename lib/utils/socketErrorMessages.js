/* eslint-disable max-len */

const {EOL} = require('os');
const {path} = require('ramda');
const colors = require('colors');
const util = require('util');

const t = require('../texts');
const {arrToString, appendDot, stripAnsiChars, placeholdEmpty} = require('./stringUtils');
const {processJsonMessageForToString} = require('./chainUtils');
const {getFirstStackLine} = require('./stackTraceParser');

/** Description of the function
 * @name ToStringFunc
 * @function
 * @param {Object} jsonMessage can be generated socket message or raw lined definition json
 * @param {boolean=} [nameOnly]
 * @returns {string}
 */

/** Error map handler
 * @name ErrorMapHandler
 * @function
 * @param {Object} data
 * @param {ToStringFunc} data.toString - chain toString function which accept socketMessage or json lined definition and return human readable representation
 * @param {Object} data.response - websocket message
 * @param {Object} data.jsonMessage - socket message or raw test command json definition
 * @returns {string}
 */

const responseMessageCode = response => path(['message', 'code'], response);
const responseMessageInfo = response => path(['message', 'info'], response);

const videoAdapterErrors = ['videoAdapterInvalidOutput', 'videoAdapterNotFunction', 'videoAdapterThrownError'];
const excludeExpectedValues = ['internalError', 'queryTimeout'];
const jsExpressionErrorType = 'jsExpressionError';
const testSnippetError = 'testSnippetError';

/**
 * @description get default error message
 * @param {Object} data
 * @param {ToStringFunc} data.toString - chain toString function which accept jsonMessage and return human readable representation
 * @param {Object} data.response - websocket message
 * @param {Object} data.jsonMessage - socket request message or raw test command json definition
 * @returns {string}
 */
function defaultMessage({jsonMessage, toString, response}) {
	const jsonDef = processJsonMessageForToString(jsonMessage);
	const errors = (response.errors && path(['condition', 'subject', 'type'])(jsonDef) !== 'network')
		? `${EOL}errors: ${JSON.stringify(response.errors)}`
		: '';
	const errorType = normalizeErrorType(response);

	if (errorType)
		return `${errorType}: "${toString(jsonMessage)}"${errors}`;
	else if (response.error)
		return `${response.error}${errors}`;

	const inspectOpt = {depth: 5, compact: true, breakLength: Infinity};

	return t.unknownServerError(
		util.inspect(jsonMessage, inspectOpt),
		util.inspect(response, inspectOpt)
	);
}

/**
 * @description Create human readable error message from suitest error response
 * @param {Object.<string, ErrorMapHandler>} [errorMap]
 * @param {ToStringFunc} toString chain toString function which accept jsonMessage and return human readable representation
 * @param {*} response websocket message
 * @param {Object} jsonMessage
 * @returns {string}
 */
function getErrorMessage({errorMap, toString, response, jsonMessage}) {
	response.errorType = normalizeErrorType(response);
	const payload = {
		toString: (jsonMsg, nameOnly) => {
			const str = toString(jsonMsg, nameOnly);

			return nameOnly ? str : appendDot(str);
		},
		response,
		jsonMessage,
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
		+ getActualExpectedValues(response, jsonMessage);
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
	if (response.results) {
		return testSnippetError;
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
 * @param {Object} jsonDef
 * @returns {string[]}
 */
function getExpressionActualExpected(res, jsonDef) {
	const values = [];
	const props = path(['condition', 'expression'])(jsonDef);

	// go through expression array
	for (let i = 0; i < res.expression.length; i++) {
		const expr = res.expression[i];
		const prop = props[i];
		const propName = prop.property;

		expr.expectedValue !== undefined && values.push(valTemplate(`${propName}: ${placeholdEmpty(expr.expectedValue)}`, false));
		expr.actualValue !== undefined && values.push(valTemplate(`${propName}: ${placeholdEmpty(expr.actualValue)}`, true));
		expr.expectedValue !== undefined && expr.actualValue && values.push('');
	}

	return values;
}

/**
 * @description creates array of actual/expected log for networkRequest
 * @param {Object} res
 * @param {Object} jsonDef
 * @returns {string[]}
 */
function getNetworkActualExpected(res, jsonDef) {
	const values = [];
	const props = {
		request: path(['condition', 'subject', 'requestInfo'], jsonDef) || [],
		response: path(['condition', 'subject', 'responseInfo'], jsonDef) || [],
	};

	// go through errors array
	for (let i = 0; i < res.errors.length; i++) {
		const error = res.errors[i];
		let expected, actual, propName;

		if (error.type === 'noUriFound') {
			expected = path(['condition', 'subject', 'val'], jsonDef);
			actual = t['actualExpected.requestNotMade']();
			propName = 'url';
			values.push(valTemplate(`${propName}: ${expected}`, false));
			values.push(valTemplate(`${propName}: ${actual}`, true));
			continue;
		}

		const nameComparator = error.type === 'header' ? error.name : '@' + error.type;
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
 * if response has errors and jsonMessage related to the networkRequest - actual/expected values will be retrieved from jsonMessage/errors array.
 * @param {Object} res
 * @param {Object} jsonMessage
 * @returns {string}
 */
function getActualExpectedValues(res, jsonMessage) {
	const values = [];
	const jsonDef = processJsonMessageForToString(jsonMessage);

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
		values.push(...getExpressionActualExpected(res, jsonDef));
	}
	// check networkRequest errors array
	else if (path(['condition', 'subject', 'type'])(jsonDef) === 'network' && Array.isArray(res.errors)) {
		values.push(...getNetworkActualExpected(res, jsonDef));
	}

	return values.length ? `${EOL}\t${t['actualExpected.failingChecks']()}${arrToString(values, true)}` : '';
}

/**
 * @type {Object.<string, ErrorMapHandler>}
 */
const errorMap = {
	failedStart: ({jsonMessage, toString}) => {
		return toString(jsonMessage);
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
	internalError: ({jsonMessage, toString}) => {
		return t['errorType.internalError'](toString(jsonMessage));
	},
	ILInternalError: ({jsonMessage, toString}) => {
		return errorMap.internalError({
			jsonMessage,
			toString,
		});
	},
	queryTimeout: ({jsonMessage, toString, response}) => {
		const code = responseMessageCode(response);

		if (code === 'missingILResponse') {
			const timeout = responseMessageInfo(response).timeout / 1000;

			return t['errorType.queryTimeout.missingILResponse'](timeout, timeout === 1 ? '' : 's', toString(jsonMessage));
		}

		return t['errorType.queryTimeout'](toString(jsonMessage));
	},
	serverError: ({jsonMessage, toString}) => {
		return t['errorType.serverError'](toString(jsonMessage));
	},
	invalidCredentials: () => {
		return t['errorType.invalidCredentials']();
	},
	syntaxError: ({jsonMessage, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'WrongDelay':
				return t['errorType.syntaxError.WrongDelay'](toString(jsonMessage));
			case 'wrongBody':
				return t['errorType.syntaxError.wrongBody'](toString(jsonMessage));
			case 'wrongUrl':
				return t['errorType.syntaxError.wrongUrl'](toString(jsonMessage));
			default:
				return t['errorType.syntaxError'](toString(jsonMessage));
		}
	},
	invalidInput: ({jsonMessage, toString, response}) => {
		const code = responseMessageCode(response);
		const modifierType = path(['request', 'type'], jsonMessage);

		switch (code) {
			case 'lineTypeNotSupported':
				return t['errorType.invalidInput.lineTypeNotSupported'](toString(jsonMessage));
			case 'elementNotSupported': {
				const modifier = {
					'click': '.click()',
					'moveTo': '.move()',
					'sendText': '.sendText()',
					'setText': '.setText()',
				}[modifierType];

				return `${toString(jsonMessage)} ${modifier} ${t['errorType.invalidInput.elementNotSupported']()}`;
			}
			default:
				return t['errorType.invalidInput'](toString(jsonMessage));
		}
	},
	ActionNotAvailable: ({jsonMessage, toString}) => {
		return t['errorType.ActionNotAvailable'](toString(jsonMessage));
	},
	/**
	 * @description this error does not exists on BE
	 * needed for queryFailed or appRunning errors for press command
	 * @param jsonMessage
	 * @param toString
	 * @returns {*}
	 */
	conditionNotSatisfied: ({jsonMessage, toString}) => {
		return t['errorType.conditionNotSatisfied'](path(['request', 'count'], jsonMessage), toString(jsonMessage));
	},
	deviceError: ({jsonMessage, toString, response}) => {
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
				jsonMessage,
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
	illegalButton: ({jsonMessage, toString}) => {
		return t['errorType.illegalButton'](toString(jsonMessage));
	},
	unsupportedButton: ({jsonMessage, toString}) => {
		return errorMap.illegalButton({
			jsonMessage,
			toString,
		});
	},
	aborted: ({jsonMessage, toString, response}) => {
		if (path(['message', 'info', 'reason'], response) === 'manualActionRequired') {
			return t['errorType.aborted.manualActionRequired']();
		}

		return t['errorType.aborted'](toString(jsonMessage));
	},
	queryFailed: ({toString, response, jsonMessage}) => {
		const code = responseMessageCode(response);
		const subjectType = path(['request', 'condition', 'subject', 'type'], jsonMessage)
			|| path(['request', 'target', 'type'], jsonMessage);

		if (path(['request', 'type'], jsonMessage) === 'button') {
			return errorMap.conditionNotSatisfied({
				jsonMessage,
				toString,
			});
		}

		switch (code) {
			case 'invalidApp':
				return errorMap.wrongApp();
			case 'invalidUrl':
				return t['errorType.queryFailed.invalidUrl'](response.actualValue, response.expectedValue);
			case 'applicationError':
				return t['errorType.queryFailed.applicationError'](toString(jsonMessage));
			case 'exprException':
				return t['errorType.queryFailed.exprException'](path(['message', 'info', 'exception'], response));
			case 'orderErr':
				return t['errorType.queryFailed.orderErr']();
			case 'updateAlert':
				return t['errorType.queryFailed.updateAlert']();
			case 'notFunction':
				return t['errorType.queryFailed.notFunction'](toString(jsonMessage));
			case 'missingSubject':
				if (subjectType === 'element')
					return t['errorType.NoSuchElement'](toString(jsonMessage, true));
				break;
			case 'psImplicitVideo':
				return t['errorType.queryFailed.psImplicitVideo']();
			default:
				break;
		}

		return defaultMessage({
			response,
			jsonMessage,
			toString,
		});
	},
	networkError: ({jsonMessage, toString}) => {
		return toString(jsonMessage);
	},
	noHasLines: ({jsonMessage, toString}) => {
		return t['errorType.noHasLines'](toString(jsonMessage));
	},
	appCrashed: ({jsonMessage, toString}) => {
		return t['errorType.appCrashed'](toString(jsonMessage));
	},
	timeLimitExceeded: ({jsonMessage, toString}) => {
		return t['errorType.timeLimitExceeded'](toString(jsonMessage));
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
	invalidValue: ({response}) => {
		const propertyName = path(['args', 'propertyName'], response);

		return t['errorType.invalidValue'](propertyName);
	},
	appRunning: ({toString, jsonMessage}) => {
		if (path(['request', 'type'], jsonMessage) === 'button') {
			return errorMap.conditionNotSatisfied({
				jsonMessage,
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
	notExpectedResponse: ({jsonMessage, toString}) => {
		return t['errorType.notExpectedResponse'](path(['request', 'url'], jsonMessage), toString(jsonMessage));
	},
	noConnection: ({jsonMessage, toString}) => {
		return t['errorType.noConnection'](path(['request', 'url'], jsonMessage), toString(jsonMessage));
	},
	invalidResult: ({jsonMessage, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'resultTooLong':
				return t['errorType.invalidResult.resultTooLong'](path(['request', 'url'], jsonMessage), toString(jsonMessage));
			default:
				break;
		}

		return t['errorType.invalidResult'](path(['request', 'url'], jsonMessage), toString(jsonMessage));
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
	invalidRepositoryReference: ({jsonMessage, toString, response}) => {
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

		return toString(jsonMessage);
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
	NoSuchElement: ({jsonMessage, toString}) => {
		return t['errorType.NoSuchElement'](toString(jsonMessage, true));
	},
	NoSuchFrame: ({jsonMessage, toString}) => {
		return t['errorType.NoSuchFrame'](toString(jsonMessage, true));
	},
	UnknownCommand: ({jsonMessage, toString}) => {
		return t['errorType.UnknownCommand'](toString(jsonMessage));
	},
	StaleElementReference: ({jsonMessage, toString}) => {
		return t['errorType.StaleElementReference'](toString(jsonMessage, true));
	},
	ElementNotVisible: ({jsonMessage, toString}) => {
		return t['errorType.ElementNotVisible'](toString(jsonMessage, true));
	},
	InvalidElementState: ({jsonMessage, toString}) => {
		return t['errorType.InvalidElementState'](toString(jsonMessage, true));
	},
	UnknownError: ({jsonMessage, toString, response}) => {
		return defaultMessage({
			jsonMessage,
			toString,
			response,
		});
	},
	ElementIsNotSelectable: ({jsonMessage, toString}) => {
		return t['errorType.ElementIsNotSelectable'](toString(jsonMessage, true));
	},
	JavaScriptError: ({jsonMessage, toString}) => {
		return `An error occurred while executing user supplied JavaScript. ${toString(jsonMessage)}`;
	},
	XPathLookupError: ({jsonMessage, toString}) => {
		return t['errorType.XPathLookupError'](toString(jsonMessage, true));
	},
	Timeout: ({jsonMessage, toString}) => {
		return t['errorType.Timeout'](toString(jsonMessage));
	},
	NoSuchWindow: ({jsonMessage, toString}) => {
		return t['errorType.NoSuchWindow'](toString(jsonMessage));
	},
	InvalidCookieDomain: ({jsonMessage, toString}) => {
		return t['errorType.InvalidCookieDomain'](toString(jsonMessage));
	},
	UnableToSetCookie: ({jsonMessage, toString}) => {
		return t['errorType.UnableToSetCookie'](toString(jsonMessage));
	},
	UnexpectedAlertOpen: ({jsonMessage, toString}) => {
		return t['errorType.UnexpectedAlertOpen'](toString(jsonMessage));
	},
	NoAlertOpenError: ({jsonMessage, toString}) => {
		return t['errorType.NoAlertOpenError'](toString(jsonMessage));
	},
	ScriptTimeout: ({jsonMessage, toString}) => {
		return t['errorType.ScriptTimeout'](toString(jsonMessage));
	},
	InvalidElementCoordinates: ({jsonMessage, toString}) => {
		return t['errorType.InvalidElementCoordinates'](toString(jsonMessage, true));
	},
	IMENotAvailable: () => {
		return t['errorType.IMENotAvailable']();
	},
	IMEEngineActivationFailed: () => {
		return t['errorType.IMEEngineActivationFailed']();
	},
	InvalidSelector: ({jsonMessage, toString}) => {
		return t['errorType.InvalidSelector'](toString(jsonMessage));
	},
	ElementNotInteractable: () => {
		return t['errorType.ElementNotInteractable']();
	},
	unknownWebDriverKey: () => {
		return t['errorType.unknownWebDriverKey']();
	},
	unfocusableElement: ({jsonMessage, toString}) => {
		return t['errorType.unfocusableElement'](toString(jsonMessage, true));
	},
	unclickableElement: ({jsonMessage, toString}) => {
		return t['errorType.unclickableElement'](toString(jsonMessage, true));
	},
	deviceConnectionError: () => {
		return t['errorType.deviceConnectionError']();
	},
	testIsNotStarted: () => {
		return t['errorType.testIsNotStarted']();
	},
	signInRequired: () => {
		return t['errorType.signInRequired']();
	},
	connectionNotAuthorized: () => {
		return t['errorType.connectionNotAuthorized']();
	},
	higherOSVersionRequired: () => {
		return t['errorType.higherOSVersionRequired']();
	},
	appleError65: () => t['errorType.appleError65'](),
	appleError70: () => t['errorType.appleError70'](),
	appleAppSignError: () => t['errorType.appleAppSignError'](),
	missingPSSDK: () => t['errorType.missingPSSDK'](),
	targetManagerBusy: () => t['errorType.targetManagerBusy'](),
	missingDotNet: () => t['errorType.missingDotNet'](),
	bootstrapAppNotDetected: () => t['errorType.bootstrapAppNotDetected'](),
	activationExpired: () => t['errorType.activationExpired'](),
	missingCpp: () => t['errorType.missingCpp'](),
	testSnippetError: ({jsonMessage}) => {
		return t['errorType.testSnippetError'](path(['request', 'val'], jsonMessage));
	},
	invalidReference: ({jsonMessage}) => {
		return t['errorType.snippetInvalidReference'](path(['request', 'val'], jsonMessage));
	},
	outdatedLibraryWarning: () => t['errorType.outdatedLibraryWarning'](),
	adbError: ({response}) => responseMessageInfo(response).reason,
};

Object.freeze(errorMap);

module.exports = {
	/**
	 * @description Create human readable error message from suitest error response
	 * @param payload
	 * @param {*} payload.jsonMessage json message
	 * @param {ToStringFunc} payload.toString chain toString function which accept jsonMessage and return human readable representation
	 * @param {{errorType: string}} payload.response websocket message
	 * @param {Object} payload.jsonMessage socket request message or raw command line definition
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
};
