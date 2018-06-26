/* eslint-disable max-len */

const {EOL} = require('os');
const {path} = require('ramda');
const t = require('../texts');
const {arrToString} = require('./stringUtils');

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

/**
 * @description get default error message
 * @param {*} chainData chain data object
 * @param {ChainToStringFunc} toString chain toString function which accept chainData and return human readable representation
 * @param {*} response webscoket message
 * @returns {string}
 */
function defaultMessage({chainData, toString, response}) {
	const errors = response.errors ? `${EOL}errors: ${JSON.stringify(response.errors)}` : '';

	return response.errorType ?
		`${response.errorType}: "${toString(chainData)}"${errors}` :
		`${response.error}${errors}`;
}

/**
 * @description Create human readable error message from suitest error response
 * @param {Object.<string, ErrorMapHandler>} [errorMap]
 * @param {*} chainData chain data object
 * @param {ChainToStringFunc} toString chain toString function which accept chainData and return human readable representation
 * @param {*} [response] webscoket message
 * @returns {string}
 */
function getErrorMessage({errorMap, chainData, toString, response}) {
	const prefix = response.result === 'fatal' ? t['response.result.fatal.prefix']() : '';
	const payload = {
		chainData,
		toString,
		response,
	};

	return prefix + (errorMap.hasOwnProperty(response.errorType) ?
		errorMap[response.errorType](payload) :
		defaultMessage(payload));
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
	queryTimeout: ({chainData, toString}) => {
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

		if (code === 'unsupportedSelector' && info.reason === 'xpathNotSupported') {
			return t['errorType.deviceError.unsupportedSelector.xpathNotSupported']();
		}

		if (code === 'deviceFailure' && info.reason === 'cssSelectorInvalid') {
			return t['errorType.deviceError.deviceFailure.cssSelectorInvalid']();
		}

		if (videoAdapterErrors.includes(code)) {
			return t['errorType.videoAdapterError'](info.reason);
		}

		return errorMap.internalError({
			chainData,
			toString,
		});
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

		if (chainData.type === 'element' && chainData.selector && !chainData.selector.apiId) {
			const selectorStr = arrToString(Object.entries(chainData.selector).map(i => `${i[0]}: ${i[1]}`), true);

			return `"${toString(chainData)} ${t['errorType.queryFailed.elementBySelectors']()}"${selectorStr}`;
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

		switch (code) {
			case 'notExistingElement':
				return t['errorType.invalidRepositoryReference.notExistingElement'](toString(chainData));
			case 'unknownProperty':
				return t['errorType.invalidRepositoryReference.unknownProperty'](path(['message', 'property'], response));
			case 'notExistingPlatform':
				return t['errorType.invalidRepositoryReference.notExistingPlatform'](toString(chainData));
			default:
				break;
		}

		return toString(chainData);
	},
	// TODO: should be - An error occurred while executing the [Open app override test name]
	openAppOverrideFailed: () => {
		return t['errorType.openAppOverrideFailed']();
	},
	Success: () => {
		return t['errorType.Success']();
	},
	NoSuchElement: ({chainData, toString}) => {
		return t['errorType.NoSuchElement'](toString(chainData));
	},
	NoSuchFrame: ({chainData, toString}) => {
		return t['errorType.NoSuchFrame'](toString(chainData));
	},
	UnknownCommand: ({chainData, toString}) => {
		return t['errorType.UnknownCommand'](toString(chainData));
	},
	StaleElementReference: ({chainData, toString}) => {
		return t['errorType.StaleElementReference'](toString(chainData));
	},
	ElementNotVisible: ({chainData, toString}) => {
		return t['errorType.ElementNotVisible'](toString(chainData));
	},
	InvalidElementState: ({chainData, toString}) => {
		return t['errorType.InvalidElementState'](toString(chainData));
	},
	UnknownError: ({chainData, toString, response}) => {
		return defaultMessage({
			chainData,
			toString,
			response,
		});
	},
	ElementIsNotSelectable: ({chainData, toString}) => {
		return t['errorType.ElementIsNotSelectable'](toString(chainData));
	},
	JavaScriptError: ({chainData, toString}) => {
		return `An error occurred while executing user supplied JavaScript. ${toString(chainData)}`;
	},
	XPathLookupError: ({chainData, toString}) => {
		return t['errorType.XPathLookupError'](toString(chainData));
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
		return t['errorType.InvalidElementCoordinates'](toString(chainData));
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
		return t['errorType.unfocusableElement'](toString(chainData));
	},
	unclickableElement: ({chainData, toString}) => {
		return t['errorType.unclickableElement'](toString(chainData));
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
};

Object.freeze(errorMap);

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
	errorMap,
	responseMessageCode,
	responseMessageInfo,
};
