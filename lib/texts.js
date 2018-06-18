/* eslint-disable max-len */

const template = (strings, ...keys) => (...values) => {
	const dict = values[values.length - 1] || {};
	const result = [strings[0]];

	keys.forEach(function(key, i) {
		const value = Number.isInteger(key) ? values[key] : dict[key];

		result.push(value, strings[i + 1]);
	});

	return result.join('');
};

/* istanbul ignore next */
module.exports = {
	// Method should accept certain type as a parameter
	acceptsStringParameter: template`${0} accepts string as s parameter`,
	acceptsPositiveIntegerParameter: template`${0} accepts positive integer number as s parameter`,
	acceptsFunctionOrString: template`${0} accepts function or a string as s parameter`,

	// Element property validation
	propExpectedToBe: template`${0} is expected to be of type ${1}`,
	unknownPropValue: template`${1} is an unknown value for property ${0}`,
	valueMustBeRepo: () => 'value is expected to be VALUE.REPO when matching against repository element',
	recursionDetected: () => 'Recursive structure detected',

	unknownError: () => 'Unknown error occurred. If you keep getting this error please get in touch with support@suite.st. If you haven\'t turned off automatic error reporting (the sentry option in config) we are already working hard to fix the issue.',
	// Auth errors
	authNotAllowed: commandName => `You're not allowed to execute .${commandName} function. Make sure you're logged in with the correct credentials.`,
	authFailed: () => 'Authentication failed. Make sure you\'re trying to login with correct credentials.',

	// General validation
	invalidInput: () => 'Invalid input',
	invalidInputMessage: (methodName, field) =>
		`provided for .${methodName} function.` + (field ? ` ${field}` : ''),
	invalidConfigObj: () => 'provided for configuration object.',

	// WebSockets errors
	wsNotConnected: () => 'Connection to Suitest has been interrupted. Please make sure you are online and double check your login credentials.',

	// Other
	failedStackTrace: () => 'Failed to fetch stack trace',
	invalidUntilChain: template`Until condition chain requires valid modifier and should be one of the following types:\n${0}`,
	chainExpected: () => 'Until condition expects a chain as an input parameter',
	invalidInheredProps: template`Properties (${0}) can be compared to repository values only for stored elements. Please ensure that element name or properties values was specified.`,
	invalidVideoInheredProps: template`Properties (${0}) can be compared to repository values only for stored elements. Please ensure that properties values was specified.`,

	/**
	 * @description SuitestError.SERVER_ERROR message
	 * @param {string} commandName
	 * @param {number} status
	 * @param {string} statusText
	 * @returns {string}
	 */
	suitestServerError: (commandName, status, statusText) => {
		return `Server error occurred${commandName ? ` while executing .${commandName} function`: ''}. ${status} - ${statusText}`;
	},
	// Chains toString conversion
	openApp: () => 'Open app',
	openAppAtURL: template`Open app at ${0}`,
	openURL: template`Open URL ${0}`,
	sleep: template`Sleep for ${0}ms`,
	pressButton: template`Press button${1} ${0}`,
	clearAppData: () => 'Clear app data',
	executeCommand: () => 'Execute command',
	application: () => 'Application has exited',
	cookieGet: template`Get ${0} cookie`,
	cookieExist: template`Check if ${0} cookie exists`,
	cookieMatchJS: template`Check if ${0} cookie matches JavaScript expression`,
	cookieNotExist: template`Check if ${0} cookie does not exist`,
	cookieNotMatchJS: template`Check if ${0} cookie does not match JavaScript expression`,
	cookieStringCondition: template`Check if ${0} cookie ${1} ${2}`,
	jsExpressionGet: () => 'Get result of JavaScript expression',
	jsExpressionStringComparator: template`Check if JavaScript expression ${0} ${1}`,
	pollUrl: template`Poll URL "${0}" every 500ms until response equals ${1}`,
	networkRequestWasMadeTo: template`Check if request to ${0} was made`,
	networkRequestWasMadeContain: template`Check if request containing ${0} in URL was made`,
	networkRequestWillBeMadeTo: template`Check if request to ${0} will be made during next ${1}ms`,
	networkRequestWillBeMadeContain: template`Check if request containing ${0} in URL will be made during next ${1}ms`,
	networkRequestMatchingParamsWasMadeTo: template`Check if request matching defined parameters to ${0} was made`,
	networkRequestMatchingParamsWasMadeContain: template`Check if request matching defined parameters containing ${0} in URL was made`,
	networkRequestMatchingParamsWillBeMadeTo: template`Check if request matching defined parameters to ${0} will be made during next ${1}ms`,
	networkRequestMatchingParamsWillBeMadeContain: template`Check if request matching defined parameters containing ${0} in URL will be made during next ${1}ms`,
	networkRequestNotWasMadeTo: template`Check if request to ${0} was not made`,
	networkRequestNotWasMadeContain: template`Check if request containing ${0} in URL was not made`,
	networkRequestNotWillBeMadeTo: template`Check if request to ${0} will be not made during next ${1}ms`,
	networkRequestNotWillBeMadeContain: template`Check if request containing ${0} in URL will be not made during next ${1}ms`,
	networkRequestNotMatchingParamsWasMadeTo: template`Check if request matching defined parameters to ${0} was not made`,
	networkRequestNotMatchingParamsWasMadeContain: template`Check if request matching defined parameters containing ${0} in URL was not made`,
	networkRequestNotMatchingParamsWillBeMadeTo: template`Check if request matching defined parameters to ${0} will be not made during next ${1}ms`,
	networkRequestNotMatchingParamsWillBeMadeContain: template`Check if request matching defined parameters containing ${0} in URL will be not made during next ${1}ms`,
	element: template`Get ${0} element properties`,
	incorrectElementIndex: () => 'the "index" supplied to the .element() selector should be > 0',
	elementExist: template`Check if ${0} element exists`,
	elementMatchJS: template`Check if ${0} element matches JavaScript expression`,
	elementNotExist: template`Check if ${0} element does not exist`,
	elementNotMatchJS: template`Check if ${0} element does not match JavaScript expression`,
	elementMatchProps: template`Check if ${0} element has defined properties`,
	elementClick: template`Click on ${0} element`,
	elementMoveTo: template`Move cursor to ${0} element`,
	elementSendText: template`Send text '${0}' to ${1} element`,
	chainRepeat: template` ${0} times every ${1}ms`,
	position: template`Position ${0}, ${1}`,
	positionClick: template`Click on ${0}, ${1} position`,
	positionMoveTo: template`Move cursor to ${0}, ${1} position`,
	refresh: () => 'Refresh browser page',
	setSize: template`Set browser window size to ${0}, ${1}`,
	goBack: () => 'Navigate back with browser history',
	goForward: () => 'Navigate forward with browser history',
	dismissModal: () => 'Dismiss browser modal dialog',
	acceptModal: () => 'Accept modal dialog',
	acceptModalWithText: template`Accept modal dialog with '${0}' message`,
	windowDefault: () => 'Window chain',
	windowSendText: template`Send text '${0}' to window`,
	location: () => 'Get current location',
	locationCheck: template`Check if current location ${0} ${1}`,
	unusedLeaves: leaves => `Some of the Suitest chains you made in your test were not executed.
You may have forgotten to put an await in front of those chains. Or, if this was intentional, add .abandon() to the end of the chain and this warning will go away.
${leaves}`,

	// test launcher
	'tl.nodevices': () => 'there is no device in config to proceed with testing',
	'tl.finishedWithErrors': () => 'Some executions finished with errors',
	'tl.finishedWithSuccess': () => 'All executions finished successfully',
	'tl.promptPassword': () => 'Please enter your passwod: ',
	'tl.failedToCreateDir': () => 'Unknown error occurred while creating a new directory',
	'tl.createDirPermissionDenied': (path) => `Cannot create log file (${path}) Permission denied`,
	'tl.startLogRecording': (device) => `Logs for device: ${device} will be written to`,
	'tl.logDirDescription': () => 'If defined, additional logging to specified folder will be performed.',
	'tl.inspectOnlyForInteractiveMode': () => 'Please use interactive mode to enable debugging.',

	// error messages
	'errorType.appRunning': () => 'App is still running.',
	'errorType.missingApp': () => 'Application is not installed on the device.',
	'errorType.initPlatformFailed': () => 'Failed to start Suitest bootstrap application on this device.',
	'errorType.packageNotFound': () => 'There is nothing to test, because the selected configuration does not contain an app package. Upload a package on your app\'s configuration page before continuing.',
	'errorType.internalError': template`Internal error occurred. ${0}`,
	'errorType.queryTimeout': template`Application did not respond for 60 seconds. ${0}`,
	'errorType.serverError': template`Server error occurred. ${0}`,
	'errorType.invalidCredentials': () => 'Credentials for this device were changed.',
	'errorType.syntaxError': template`Test command received invalid input. ${0}`,
	'errorType.syntaxError.WrongDelay': template`Test command received invalid input. Delay value is invalid. ${0}`,
	'errorType.syntaxError.wrongBody': template`Body field value is exceeding 4KB limit. ${0}`,
	'errorType.syntaxError.wrongUrl': template`This does not look like a valid URL. ${0}`,
	'errorType.invalidInput': template`Test command received invalid input. ${0}`,
	'errorType.invalidInput.lineTypeNotSupported': template`This test command is not supported by the current app configuration. ${0}`,
	'errorType.ActionNotAvailable': template`This test command is not supported by the current app configuration. ${0}`,
	'errorType.conditionNotSatisfied': template`Maximum amount of key presses ${0} reached. Condition was not satisfied. ${1}`,
	'errorType.deviceError.unsupportedSelector.xpathNotSupported': () => 'The element cannot be found, because this device does not support XPath.',
	'errorType.deviceError.deviceFailure.cssSelectorInvalid': () => 'The element cannot be found, the identifying property css selector is invalid.',
	'errorType.wrongApp': () => 'Wrong app ID detected',
	'errorType.driverException': () => 'Unexpected exception occurred on connected device. Please, contact support@suite.st if you see this often.',
	'errorType.illegalButton': template`Specified buttons are not supported on this device. ${0}`,
	'errorType.aborted': template`Test execution was aborted. ${0}`,
	'errorType.queryFailed.invalidUrl': template`App loaded ${0} instead of the expected ${1}. Consider updating the app URL in settings.`,
	'errorType.queryFailed.applicationError': template`Application thrown unexpected error while executing command "${0}".`,
	'errorType.queryFailed.exprException': template`JavaScript error: ${0}.`,
	'errorType.queryFailed.orderErr': () => 'Suitest instrumentation library should be placed as the first script in your HTML file. Loading the instrumentation library dynamically or after other scripts have loaded may cause many unusual errors.',
	'errorType.queryFailed.updateAlert': () => 'Suitest instrumentation library is outdated. Please download and install the newest version.',
	'errorType.queryFailed.notFunction': template`Specified code is not a function. ${0}`,
	'errorType.noHasLines': template`No assertion properties defined. ${0}`,
	'errorType.appCrashed': template`App seems to have crashed. ${0}`,
	'errorType.timeLimitExceeded': template`Time limit has been exceeded. ${0}`,
	'errorType.notResponding': () => 'Device stopped responding.',
	'errorType.suitestifyError': () => 'Suitestify failed to start. Check your Suitestify settings.',
	'errorType.suitestifyRequired': () => 'This assertion only works with Suitestify. You can configure your app to use Suitestify in the app settings. Please note that Suitestify is not available for all platforms.',
	'errorType.invalidVariable0': () => 'Variable is not defined in the app configuration.',
	'errorType.invalidVariable1': template`Variable ${0} is not defined in the app configuration.`,
	'errorType.invalidVariable2': template`Variables ${0} are not defined in the app configuration.`,
	'errorType.bootstrapPageNotDetected': () => 'App seems to have exited correctly but something went wrong when loading the Suitest channel autostart application.',
	'errorType.wrongAppDetected': () => 'App seems to have exited correctly, however another app has been opened.',
	'errorType.notExpectedResponse': template`Unexpected response received while polling ${0}. ${1}`,
	'errorType.noConnection': template`Could not connect to server while polling ${0}. ${1}`,
	'errorType.invalidResult': template`Unexpected response received while polling ${0}. ${1}`,
	'errorType.invalidResult.resultTooLong': template`Response exceeded the size limit of 4KB while polling ${0}. ${1}`,
	'errorType.lateManualLaunch': () => 'In this configuration the "open app" commands inside the test are not supported. You may however start the test with "open app" command.',
	'errorType.launchExpired': () => 'Identical scheduling aborted.',
	'errorType.notActiveDeveloperMode': () => 'Failed to launch application. Is "developer mode" turned on?',
	'errorType.invalidUrl': () => 'Application could not be launched. Please verify you have provided URL for this configuration.',
	'errorType.invalidRepositoryReference.notExistingElement': template`Element was not found in repository. ${0}`,
	'errorType.invalidRepositoryReference.unknownProperty': template`This element does not support property ${0}.`,
	'errorType.invalidRepositoryReference.notExistingPlatform': template`Element is not defined for selected platform. ${0}`,
	'errorType.openAppOverrideFailed': () => 'An error occurred while executing the "Open app override test".',
	'errorType.Success': () => 'Command executed successfully.',
	'errorType.NoSuchElement': template`An element could not be located on the page using the given search parameters. ${0}`,
	'errorType.NoSuchFrame': template`A request to switch to a frame could not be satisfied because the frame could not be found. ${0}`,
	'errorType.UnknownCommand': template`The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource. ${0}`,
	'errorType.StaleElementReference': template`Referenced element is no longer in the DOM. ${0}`,
	'errorType.ElementNotVisible': template`Referenced element is not visible on the page. ${0}`,
	'errorType.InvalidElementState': template`An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element). ${0}`,
	'errorType.ElementIsNotSelectable': template`An attempt was made to select an element that cannot be selected. ${0}`,
	'errorType.XPathLookupError': template`An error occurred while searching for an element by XPath. ${0}`,
	'errorType.Timeout': template`This command takes too long to execute. ${0}`,
	'errorType.NoSuchWindow': template`A request to switch to a different window could not be satisfied because the window could not be found. ${0}`,
	'errorType.InvalidCookieDomain': template`Cannot set a cookie on a domain different from the current page. ${0}`,
	'errorType.UnableToSetCookie': template`Cannot set the specified cookie value. ${0}`,
	'errorType.UnexpectedAlertOpen': template`A modal dialog was open, blocking this operation. ${0}`,
	'errorType.NoAlertOpenError': template`There was no modal dialog on the page. ${0}`,
	'errorType.ScriptTimeout': template`A script takes too long to execute. ${0}`,
	'errorType.InvalidElementCoordinates': template`The coordinates provided to an interactions operation are invalid. ${0}`,
	'errorType.IMENotAvailable': () => 'IME was not available.',
	'errorType.IMEEngineActivationFailed': () => 'An IME engine could not be started.',
	'errorType.InvalidSelector': template`This selector is malformed. ${0}`,
	'errorType.unknownWebDriverKey': () => 'This key is not supported on the target device.',
	'errorType.unfocusableElement': template`The target element is not designed to receive any text input. ${0}`,
	'errorType.unclickableElement': template`Another element is obstructing the target element, so it cannot be clicked on. ${0}`,
	'errorType.appiumInstanceError': () => 'Failed to initialize device control.',
	'errorType.deviceConnectionError': () => 'Failed to initialize device control.',
	'errorType.landingActivityTimeoutError': template`We have waited for the requested activity to open, but instead the ${0} was started. Please check the configuration settings.`,

	'response.result.fatal.prefix': () => 'Fatal. ',

	// Warnings
	warnConfigureDeprecation: () => '.configure() command is deprecated and will be removed soon. Use .suitestrc file or cli args for configuration.',

	// Cli args
	cliLogLevel: () => 'Logger verbosity level',
	cliDisallowCrashReports: () => 'Disallow Suitest to submit automatic crash reports when unexpected exceptions occur',
	cliContinueOnFatalError: () => 'Do not force process exit when suitest chain fails with fatal error',

	// interactive test progress status
	'interactiveProgress.status.openingApp': () => 'Trying to open app...',
	'interactiveProgress.status.closingApp': () => 'Trying to close app...',
	'interactiveProgress.status.bootingDevice': () => 'Running the boot sequence defined for the device...',
	'interactiveProgress.status.needManual': () => 'Paused. For this platform, install and open the application manually.',
	'interactiveProgress.status.recoveringID': () => 'Trying to recover Suitest device ID...',
	'interactiveProgress.status.waitingForConnectionFromBootstrap': () => 'Waiting for connection from the Suitest app on device...',
	'interactiveProgress.status.waitingForConnectionFromIL': () => 'Waiting for connection from the instrumentation library...',
	'interactiveProgress.status.unistallingApp': () => 'Uninstalling app...',
	'interactiveProgress.status.uploadingAndInstallingApp': () => 'Uploading and installing app...',
	// interactive test progress code
	'interactiveProgress.code.blasterError': () => 'Cannot continue: IR blaster missing or incorrectly attached.',
	'interactiveProgress.code.bootstrappedPlatformError': () => 'Cannot continue: Suitest bootstrap app is not running.',
	'interactiveProgress.code.testQueued': () => 'Execution will start as soon as other tests queued on this device will finish execution.',
	'interactiveProgress.code.candyBoxOffline': () => 'Cannot continue: CandyBox controlling this device is offline.',
	'interactiveProgress.code.suitestDriveOffline': () => 'Cannot continue: SuitestDrive controlling this device is offline.',
	'interactiveProgress.code.runningBootSequence': () => 'Trying to open Suitest bootstrap application.',
	'interactiveProgress.code.deviceInUse': () => 'A user is currently connected to this device. Execution will continue after the user disconnects.',
	'interactiveProgress.code.deviceDisabled': () => 'This device is disabled. For the execution to continue please enable the device.',
	'interactiveProgress.code.deviceDeleted': () => 'Cannot continue: Device is deleted',
	'interactiveProgress.code.internalError': () => 'Cannot continue: Internal error occurred.',
	'interactiveProgress.code.notDefinedPlatform': () => 'Cannot continue: Device does not support this platform.',
	'interactiveProgress.code.lgWebosPlatformError': () => 'Cannot continue: LG WebOS driver failed.',
	'interactiveProgress.code.xboxPlatformError': () => 'Cannot continue: Xbox driver failed.',
};
