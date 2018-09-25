/* eslint-disable max-len */
const logLevels = require('./constants/logLevels');
const timestamp = require('./constants/timestamp');

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

	unknownError: () => 'Unknown error occurred. If you keep getting this error please get in touch with support@suite.st. If you haven\'t turned off automatic error reporting (the disallowCrashReports option in config) we are already working hard to fix the issue.',
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
	openApp: (page) => `Opening app at ${page || 'homepage'}`,
	openURL: template`Opening ${0}`,

	sleep: template`Sleeping for ${0}ms`,

	pressButton: template`Pressing button${1} ${0}`,

	clearAppData: () => 'Cleared app data',

	executeCommand: template`Executing command:\n${0}`,

	application: () => 'Application has exited', // todo this needs to be clarified

	cookieGet: template`Getting "${0}" cookie`,
	cookieExist: template`Checking if "${0}" cookie exists`,
	cookieMatchJS: template`Checking if "${0}" cookie matches JS:\n${1}`,
	cookieNotExist: template`Checking if "${0}" cookie is missing`,
	cookieNotMatchJS: template`Checking if "${0}" cookie does not match JS:\n${1}`,
	cookieStringCondition: template`Checking if "${0}" cookie ${1} ${2}`,

	jsExpressionGet: expr => `Evaluating JS:\n${expr.toString()}`,
	jsExpressionStringComparator: template`Check if JS expression\n${2}\n${0} string "${1}"`,

	pollUrl: template`Will poll "${0}" every 500ms until response equals "${1}"`,

	networkRequestIntro: template`Checking if a network request`,
	networkRequestURL: (matching, url) => `${matching? 'matching' : 'to URL'}: ${url}`,
	networkRequestAction: function(isNegated, willBe, time) {
		const actions = [['was', 'will'], ['was NOT', 'will NOT be']];
		const action = actions[+!!isNegated][+!!willBe];

		return willBe? `${action} made during the next ${time} ms` : `${action} made`;
	},
	networkRequestHeaders: (headers, isRequest) =>
		`With ${isRequest? 'request' : 'response'} headers: \n${headers.map(h => '  ' + h.name + ': ' + h.val).join('\n')}`,

	incorrectElementIndex: () => 'the "index" supplied to the .element() selector should be > 0',
	element: template`Getting properties of "${0}"`,
	elementExist: template`Checking if "${0}" exists`,
	elementMatchJS: template`Checking if "${0}" matches JS:\n${1}`,
	elementNotExist: template`Checking if "${0}" is missing`,
	elementNotMatchJS: template`Checking if "${0}" does not match JS:\n${1}`,
	elementMatchProps: template`Checking if "${0}" matches:${1}`,
	elementClick: template`Clicking on "${0}"`,
	elementMoveTo: template`Moving mouse to "${0}"`,
	elementSendText: template`Sending text "${0}" to "${1}"`,

	chainRepeat: template`, repeat ${0} times every ${1} ms`,

	position: template`Position ${0}, ${1}`,
	positionClick: template`Clicking at [${0}, ${1}]`,
	positionMoveTo: template`Moving cursor to position [${0}, ${1}]`,

	refresh: () => 'Refreshing browser page',
	setSize: template`Setting browser window size to ${0}, ${1}`,
	goBack: () => 'Navigating back in browser history',
	goForward: () => 'Navigating forward in browser history',
	dismissModal: () => 'Dismissing modal dialog',
	acceptModal: () => 'Accepting modal dialog',
	acceptModalWithText: template`Accepting modal dialog with '${0}' message`,
	windowDefault: () => 'Window chain',
	windowSendText: template`Sending text "${0}" to window`,

	location: () => 'Getting current location',
	locationCheck: template`Checking if current location ${0} "${1}"`,

	unusedLeaves: leaves => `Some of your Suitest chains were not executed.
Put an "await" in front of those chains or call .abandon() to suppress these warnings.
${leaves}`,

	// test launcher
	launcherGreeting: (version, runMode) => {
		return '' +
		`Hi there! This is 🍭 Suitest test launcher v${version}.\n` +
		`Preparing to start execution in ${runMode.toLowerCase()} mode ...\n\n`;
	},

	launcherSummaryInteractive: (testCommand, executionLog, device) => {
		return '' +
		`Test command: ${testCommand}\n` +
		`Execution log: ${executionLog}\n` +
		`Device: ${device}\n\n` +

		'TIP: Assertions are marked with "A", chain evaluations are marked with "E".\n';
	},

	launcherSummaryAutomated: (testPackId, testCommand, executionLog, ...devices) => {
		return '' +
			`Test pack id: ${testPackId}\n` +
			`Test command: ${testCommand}\n` +
			`Execution log: ${executionLog}\n` +
			'Devices: \n' +
			`  - ${devices.join('\n  - ')}`;
	},

	fileLogSummary: (testCommand, orgId, appConfigId, testPackId, startTime) => {
		return '' +
			'Suitest test execution log\n' +
			'--------------------------\n\n' +
			`- Date ${startTime}.\n` +
			`- Organization ID: ${orgId}\n` +
			`- App config ID: ${appConfigId}\n` +
			(testPackId? `- Test pack ID: ${testPackId}\n` : '') +
			`- Test command: ${testCommand}\n\n\n`;
	},

	launcherWrongDeviceId: template`The deviceId ${0} is unknown. Device may have been deleted.`,

	'tl.noArguments': () => 'Command was not specified',
	'tl.seeMoreCommandsOptions': template`Run ${0} or ${1} to see those commands options`,
	'tl.finishedWithErrors': () => 'Some executions finished with errors',
	'tl.finishedWithSuccess': () => 'All executions finished successfully',
	'tl.promptPassword': () => 'Please enter your passwod: ',
	'tl.failedToCreateDir': (code, path) => `${code} error occurred while creating a new directory "${path}"`,
	'tl.createDirPermissionDenied': (path) => `Cannot create log file (${path}) Permission denied`,
	'tl.executionMode': template`Execution mode: `,
	'tl.cmdAttributionTip': template`\nTIP: Assertions are marked with "A", chain evaluations are marked with "E".`,
	'tl.logDirDescription': () => 'If defined, additional logging to specified folder will be performed.',
	'tl.inspectOnlyForInteractiveMode': () => 'Please use interactive mode to enable debugging.',
	'tl.differentLauncherAndLibVersions': template`The version of suitest library (${0}) provided from your script is different from suitest launcher (${1})`,
	'tl.newVersionAvailable': template`New version (${0}) of Suitest JavaScript API is out, please upgrade.`,

	// error messages
	'errorType.appRunning': () => 'App is still running.',
	'errorType.missingApp': () => 'Application is not installed on the device.',
	'errorType.initPlatformFailed': () => 'Failed to start Suitest bootstrap application on this device.',
	'errorType.packageNotFound': () => 'There is nothing to test, because the selected configuration does not contain an app package. Upload a package on your app\'s configuration page before continuing.',
	'errorType.internalError': template`Internal error occurred. ${0}`,
	'errorType.queryTimeout': template`Application did not respond for 60 seconds. Executing "${0}".`,
	'errorType.queryTimeout.missingILResponse': template`The wait time exceeded ${0} second${1}. Executing "${2}".`,
	'errorType.serverError': template`Server error occurred. ${0}`,
	'errorType.invalidCredentials': () => 'Credentials for this device were changed.',
	'errorType.syntaxError': template`Test command received invalid input. ${0}`,
	'errorType.syntaxError.WrongDelay': template`Test command received invalid input. Delay value is invalid. ${0}`,
	'errorType.syntaxError.wrongBody': template`Body field value is exceeding 4KB limit. ${0}`,
	'errorType.syntaxError.wrongUrl': template`This does not look like a valid URL. ${0}`,
	'errorType.syntaxError.modifierMissing': template`${0} chain missing modifier.`,
	'errorType.invalidInput': template`Test command received invalid input. ${0}`,
	'errorType.invalidInput.lineTypeNotSupported': template`This test command is not supported by the current app configuration. ${0}`,
	'errorType.ActionNotAvailable': template`This test command is not supported by the current app configuration. ${0}`,
	'errorType.conditionNotSatisfied': template`Maximum amount of key presses ${0} reached. Condition was not satisfied. ${1}`,
	'errorType.deviceError.unsupportedSelector.xpathNotSupported': () => 'The element cannot be found, because this device does not support XPath.',
	'errorType.deviceError.deviceFailure.cssSelectorInvalid': () => 'The element cannot be found, the identifying property css selector is invalid.',
	'errorType.deviceError.jsExpression': template`JavaScript expression error: "${0}".`,
	'errorType.wrongApp': () => 'Wrong app ID detected',
	'errorType.driverException': () => 'Unexpected exception occurred on connected device. Please, contact support@suite.st if you see this often.',
	'errorType.illegalButton': template`Specified buttons are not supported on this device. ${0}`,
	'errorType.aborted': template`Test execution was aborted. ${0}`,
	'errorType.aborted.manualActionRequired': () => 'Manual actions are not supported.',
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
	'errorType.videoAdapterError': template`Video adapter error: ${0}.`,
	'errorType.testIsNotStarted': () => 'Cannot continue with the current test anymore because of previous errors or bad initialization.',

	// actual/expected
	'actualExpected.failingChecks': () => 'Failing checks:',
	'actualExpected.requestNotMade': () => 'request was not made',
	'actualExpected.unknown': () => 'unknown',
	'actualExpected.notFound': () => 'not found',

	// prefixes
	'prefix.fatal': () => 'Fatal: ',
	'prefix.warning': () => 'Warning: ',

	'prefix.assertionFailed': () => 'Assertion failed. ',

	// suffixes
	'suffix.sessionWillClose': () => 'Test session will now close and all remaining Suitest commands will fail. To allow execution of remaining Suitest commands call suitest.startTest() or fix this error.',

	// logger msg
	commandExecuted: (name) => `command "${name}" was executed`,
	sessionOpen: () => 'Connecting to Suitest ...',
	sessionOpened: () => 'Connected to Suitest',
	sessionClosing: () => 'Disconnecting from Suitest',
	sessionClosed: () => 'Disconnected from Suitest',
	commandWillBeExecuted: (name) => `command "${name}" will be executed`,

	connectingToDevice: (name, id) => `Connecting to "${name}" (${id})`,
	connectedToDevice: (name, id) => `Connected to "${name}" (${id})`,

	usingAppConfig: (id) => `Setting app configuration id: ${id}`,
	usedAppConfig: (id) => `Will use app configuration id: ${id}`,
	useAppConfigOverrides: () => 'Will apply configuration overrides',

	disconnectedFromDevice: () => 'Disconnected from device',
	disconnectingFromDevice: () => 'Disconnecting from device',
	testWillBeStarted: (name) => `Test ${name} will be started`,
	testWasStarted: (name) => `Test ${name} was started`,
	testPackWillBeStarted: (name) => `Test pack ${name} will be started`,
	testPackWasStarted: (name) => `Test pack ${name} was started`,

	// Warnings
	warnConfigureDeprecation: () => '.configure() command is deprecated and will be removed soon. Use .suitestrc file or cli args for configuration.',

	replWarnInteractive: () => 'Ignored the "interactive" command. This command works only in the interactive mode.',
	replHelpRepeatLastCmd: () => 'repeat last command',
	replWelcomeMessage: (vars, cwd, watch, repeater, varColor) => {
		return '' +
		'Test execution has been paused for the interactive session\n' +
		'Now you can:\n\n' +

		'  1. Edit watched files - Suitest will reload them and execute the repeater\n' +
		'     function every time they change on disk.\n' +
		'  2. Use the prompt below to execute any JavaScript in real time.\n\n' +

		'Here is your environment:\n\n' +

		`  Current working dir: ${varColor(cwd)}\n` +
		`  Repeater function: ${varColor(repeater)}\n` +
		`  Available local variables: ${varColor(Object.keys(vars).join(', '))}\n` +
		'  Watched files (relative to your working dir):\n' +
		`    - ${varColor(watch.join('    - '))}\n\n`;
	},
	replSessionEnded: () => 'Exiting interactive session and continuing test execution.',
	replFailedToRequire: template`Failed to require file ${0}. (You may need to update your "watch" parameter)`,
	replFailedToCreateIpc: template`Failed to create IPC server. Port ${0} is busy.`,
	replIpcErrorInChildProcess : template`IPC error in child process `,
	replIpcNotImplemented : `IPC protocol not implemented for message: ${0}`,

	// Cli args
	cliLogLevel: () => `Logger verbosity level [default: "${logLevels.normal}"]`,
	cliDisallowCrashReports: () => 'Disallow Suitest to submit automatic crash reports when unexpected exceptions occur',
	cliContinueOnFatalError: () => 'Do not force process exit when suitest chain fails with fatal error',
	cliTimestamp: () => `Logger timestamp format. Use "${timestamp.none}" to disable. [default: "${timestamp.default}"]. This string is processed with momentJS.`,

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
