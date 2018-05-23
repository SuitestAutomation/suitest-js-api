/* eslint-disable max-len */

const {EOL} = require('os');
const {path} = require('ramda');
const texts = require('../texts');

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

/**
 * @description get default error message
 * @param {*} chainData chain data object
 * @param {ChainToStringFunc} toString chain toString function which accept chainData and return human readable representation
 * @param {*} response webscoket message
 * @returns {string}
 */
function defaultMessage({chainData, toString, response}) {
	const errors = response.errors ? `${EOL}errors: ${JSON.stringify(response.errors)}` : '';

	return `${response.errorType}: "${toString(chainData)}"${errors}`;
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
	const payload = {
		chainData,
		toString,
		response,
	};

	return errorMap.hasOwnProperty(response.errorType) ?
		errorMap[response.errorType](payload) :
		defaultMessage(payload);
}

/**
 * @type {Object.<string, ErrorMapHandler>}
 */
const errorMap = {
	failedStart: ({chainData, toString}) => {
		return toString(chainData);
	},
	missingApp: () => {
		return 'Application is not installed on the device.';
	},
	initPlatformFailed: ({chainData, toString}) => {
		return `Failed to initialize device (Suitest base application). ${toString(chainData)}`;
	},
	packageNotFound: () => {
		return 'Missing package for selected configuration.';
	},
	missingPackage: () => {
		return errorMap.packageNotFound();
	},
	internalError: ({chainData, toString}) => {
		return `Internal error occurred. ${toString(chainData)}`;
	},
	ILInternalError: ({chainData, toString}) => {
		return errorMap.internalError({
			chainData,
			toString,
		});
	},
	queryTimeout: ({chainData, toString}) => {
		return `Application did not respond for 60 seconds. ${toString(chainData)}`;
	},
	serverError: ({chainData, toString}) => {
		return `Server error occurred. ${toString(chainData)}`;
	},
	invalidCredentials: () => {
		return 'Credentials for this device were changed.';
	},
	syntaxError: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'WrongDelay':
				return `Test line is malformed. Delay value is invalid. ${toString(chainData)}`;
			case 'wrongBody':
				return `Body field value is exceeding 4KB limit. ${toString(chainData)}`;
			case 'wrongUrl':
				return `This does not look like a valid URL. ${toString(chainData)}`;
			default:
				return `Test line is malformed. ${toString(chainData)}`;
		}
	},
	invalidInput: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'lineTypeNotSupported':
				return `The line is not supported by this configuration. ${toString(chainData)}`;
			default:
				return `Test line is malformed. ${toString(chainData)}`;
		}
	},
	ActionNotAvailable: ({chainData, toString}) => {
		return `The line is not supported by this configuration. ${toString(chainData)}`;
	},
	conditionNotSatisfied: ({chainData, toString}) => {
		return `Maximum amount of key presses reached. Condition was not satisfied. ${toString(chainData)}`;
	},
	deviceError: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);
		const info = responseMessageInfo(response);

		if (code === 'unsupportedSelector') {
			switch (info.reason) {
				case 'xpathNotSupported':
					return 'The element cannot be found, because this device does not support XPath.';
				case 'cssSelectorInvalid':
					return 'The element cannot be found, the identifying property css selector is invalid.';
				default:
					break;
			}
		}

		return errorMap.internalError({
			chainData,
			toString,
		});
	},
	wrongApp: () => {
		return 'Wrong app ID detected';
	},
	driverException: () => {
		return 'Device failed';
	},
	illegalButton: ({chainData, toString}) => {
		return `Device does not support selected buttons. ${toString(chainData)}`;
	},
	unsupportedButton: ({chainData, toString}) => {
		return errorMap.illegalButton({
			chainData,
			toString,
		});
	},
	aborted: ({chainData, toString}) => {
		return `Test execution was aborted. ${toString(chainData)}`;
	},
	queryFailed: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'invalidApp':
				return errorMap.wrongApp();
			case 'invalidUrl':
				return `App loaded ${response.actualValue} instead of the expected ${response.expectedValue}. Consider updating the app URL in settings`;
			case 'applicationError':
				return 'Application error occurred';
			case 'exprException':
				return `An exception ${path(['message', 'info', 'exception'], response)} was thrown.`;
			case 'orderErr':
				return 'Suitest JS library must be included before any other JS in the HTML file.';
			case 'updateAlert':
				return 'Suitest JS library is outdated, please download and install newer version.';
			case 'notFunction':
				return `Specified code is not a function. ${toString(chainData)}`;
			default:
				break;
		}

		return defaultMessage({
			response,
			chainData,
			toString,
		});
	},
	exit: () => {
		return 'Application testing was exited';
	},
	networkError: ({chainData, toString}) => {
		return toString(chainData);
	},
	noHasLines: ({chainData, toString}) => {
		return `No assertion properties defined. ${toString(chainData)}`;
	},
	appCrashed: ({chainData, toString}) => {
		return `App seems to have crashed. ${toString(chainData)}`;
	},
	timeLimitExceeded: ({chainData, toString}) => {
		return `Time limit has been exceeded. ${toString(chainData)}`;
	},
	notResponding: () => {
		return 'Device stopped responding';
	},
	suitestifyError: () => {
		return 'Suitestify failed to start. Check your Suitestify settings.';
	},
	suitestifyRequired: () => {
		return 'Suitestify must be configured in order to use this type of assertion.';
	},
	invalidVariable: () => {
		return 'Configuration variables are not defined.';
	},
	appRunning: ({chainData}) => {
		let msg = texts['err.msg.appRunning']();

		if (chainData.type === 'press') {
			msg += EOL + texts['err.msg.conditionNotSatisfied'](chainData.repeat);
		}

		return msg;
	},
	bootstrapPageNotDetected: () => {
		return 'App seems to have exited correctly but something went wrong when loading the Suitest channel autostart application.';
	},
	wrongAppDetected: () => {
		return 'App seems to have exited correctly, however another app has been opened.';
	},
	notExpectedResponse: ({chainData, toString}) => {
		return `Unexpected response received while polling ${chainData.url}. ${toString(chainData)}`;
	},
	noConnection: ({chainData, toString}) => {
		return `Could not connect to server while polling ${chainData.url}. ${toString(chainData)}`;
	},
	invalidResult: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'resultTooLong':
				return `Response exceeded the size limit of 4KB while polling ${chainData.url}. ${toString(chainData)}`;
			default:
				break;
		}

		return `Unexpected response received while polling ${chainData.url}. ${toString(chainData)}`;
	},
	lateManualLaunch: () => {
		return 'For this platform, open app lines are only allowed at the beginning of the test.';
	},
	launchExpired: () => {
		return 'Identical scheduling aborted';
	},
	deviceIsBusy: () => {
		return errorMap.launchExpired();
	},
	notActiveDeveloperMode: () => {
		return 'Failed to launch application. Is "developer mode" turned on?';
	},
	invalidUrl: () => {
		return 'Application could not be launched. Please verify you have provided URL for this configuration.';
	},
	invalidRepositoryReference: ({chainData, toString, response}) => {
		const code = responseMessageCode(response);

		switch (code) {
			case 'notExistingElement':
				return `Element was not found in repository. ${toString(chainData)}`;
			case 'unknownProperty':
				return `This element does not support property ${path(['message', 'property'], response)}`;
			case 'notExistingPlatform':
				return `Element is not defined for selected platform. ${toString(chainData)}`;
			default:
				break;
		}

		return toString(chainData);
	},
	openAppOverrideFailed: () => {
		return 'Open app override failed';
	},
	Success: () => {
		return 'The command executed successfully';
	},
	NoSuchElement: ({chainData, toString}) => {
		return `An element could not be located on the page using the given search parameters. ${toString(chainData)}`;
	},
	NoSuchFrame: ({chainData, toString}) => {
		return `A request to switch to a frame could not be satisfied because the frame could not be found. ${toString(chainData)}`;
	},
	UnknownCommand: ({chainData, toString}) => {
		return `The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource. ${toString(chainData)}`;
	},
	StaleElementReference: ({chainData, toString}) => {
		return `An element command failed because the referenced element is no longer attached to the DOM. ${toString(chainData)}`;
	},
	ElementNotVisible: ({chainData, toString}) => {
		return `An element command could not be completed because the element is not visible on the page. ${toString(chainData)}`;
	},
	InvalidElementState: ({chainData, toString}) => {
		return `An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element). ${toString(chainData)}`;
	},
	UnknownError: ({chainData, toString}) => {
		return `An unknown server-side error occurred while processing the command. ${toString(chainData)}`;
	},
	ElementIsNotSelectable: ({chainData, toString}) => {
		return `An attempt was made to select an element that cannot be selected. ${toString(chainData)}`;
	},
	JavaScriptError: ({chainData, toString}) => {
		return `An error occurred while executing user supplied JavaScript. ${toString(chainData)}`;
	},
	XPathLookupError: ({chainData, toString}) => {
		return `An error occurred while searching for an element by XPath. ${toString(chainData)}`;
	},
	Timeout: ({chainData, toString}) => {
		return `An operation did not complete before its timeout expired. ${toString(chainData)}`;
	},
	NoSuchWindow: ({chainData, toString}) => {
		return `A request to switch to a different window could not be satisfied because the window could not be found. ${toString(chainData)}`;
	},
	InvalidCookieDomain: ({chainData, toString}) => {
		return `An illegal attempt was made to set a cookie under a different domain than the current page. ${toString(chainData)}`;
	},
	UnableToSetCookie: ({chainData, toString}) => {
		return `A request to set a cookie's value could not be satisfied. ${toString(chainData)}`;
	},
	UnexpectedAlertOpen: ({chainData, toString}) => {
		return `A modal dialog was open, blocking this operation. ${toString(chainData)}`;
	},
	NoAlertOpenError: ({chainData, toString}) => {
		return `There was no modal dialog on the page. ${toString(chainData)}`;
	},
	ScriptTimeout: ({chainData, toString}) => {
		return `A script did not complete before its timeout expired. ${toString(chainData)}`;
	},
	InvalidElementCoordinates: ({chainData, toString}) => {
		return `The coordinates provided to an interactions operation are invalid. ${toString(chainData)}`;
	},
	IMENotAvailable: () => {
		return 'IME was not available.';
	},
	IMEEngineActivationFailed: () => {
		return 'An IME engine could not be started.';
	},
	InvalidSelector: ({chainData, toString}) => {
		return `Argument was an invalid selector (e.g. XPath/CSS). ${toString(chainData)}`;
	},
	unknownWebDriverKey: () => {
		return 'Unable to send a key to the device';
	},
	unfocusableElement: ({chainData, toString}) => {
		return `Element can't receive focus to enter text. ${toString(chainData)}`;
	},
	unclickableElement: ({chainData, toString}) => {
		return `Element click is obstucted by different element. ${toString(chainData)}`;
	},
	appiumInstanceError: () => {
		return 'Failed to initialize device control.';
	},
	deviceConnectionError: () => {
		return 'Failed to initialize device control.';
	},
	landingActivityTimeoutError: ({response}) => {
		const info = responseMessageInfo(response) || {};

		return `We have waited for the requested activity to open, but instead the ${info.currentLandingActivity} was started. Please check the configuration settings.`;
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
