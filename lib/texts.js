/* eslint-disable max-len */
const logLevels = require('./constants/logLevels');
const timestamp = require('./constants/timestamp');
const {EOL} = require('os');

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
	acceptsStringParameter: template`${0} accepts string as a parameter`,
	acceptsPositiveIntegerParameter: template`${0} accepts positive integer number as a parameter`,
	acceptsFunctionOrString: template`${0} accepts function or a string as a parameter`,

	// Element property validation
	propExpectedToBe: template`${0} is expected to be of type ${1}`,
	unknownPropValue: template`${1} is an unknown value for property ${0}`,
	valueMustBeRepo: () => 'value is expected to be VALUE.REPO when matching against repository element',
	recursionDetected: () => 'Recursive structure detected',

	unknownError: () => 'Unknown error occurred. If you keep getting this error please get in touch with support@suite.st. If you haven\'t turned off automatic error reporting (the disallowCrashReports option in config) we are already working hard to fix the issue.',
	// Auth errors
	authNotAllowed: commandName => `You're not allowed to execute .${commandName} function. Make sure you're logged in with the correct credentials.`,
	authFailed: () => 'Authentication failed. Make sure you\'re trying to login with correct credentials.',
	notWhitelistedIp: () => 'Unauthorized access - your IP address is not whitelisted. Please contact your Suitest administrator for more information.',
	connectionNotEstablished: () => 'A session with the Suitest server was not established or was already closed. You need to open a session before you can execute test commands',

	// General validation
	invalidInput: () => 'Invalid input',
	invalidInputMessage: (methodName, field) =>
		`provided for .${methodName} function.` + (field ? ` ${field}` : ''),
	invalidConfigObj: () => 'provided for configuration object.',
	invalidUserConfig: template`Failed to process config file '${0}'.\n\t${1}.\n\tMake sure path is correct and file is in valid format.`,
	circularDependencyError: (path) => `Circular dependency found on ${path} path.`,

	// WebSockets errors
	wsNotConnected: () => 'Connection to Suitest has been interrupted. Please make sure you are online and double check your login credentials.',

	// Other
	failedStackTrace: () => 'Failed to fetch stack trace',
	invalidUntilChain: template`Until condition chain requires valid modifier and should be one of the following types:\n${0}`,
	chainExpected: () => 'Until condition expects a chain as an input parameter',
	invalidInheredProps: template`Matching properties against repo values works only for elements stored in repo.\nEither select the element by it's API-ID or specify property values to match against.\nAffected properties: ${0}`,
	invalidVideoInheredProps: template`Matching properties against repo values works only for elements stored in repo. \nEither select the element by it's API-ID or specify property values to match against.\nAffected properties: ${0}`,

	/**
	 * @description SuitestError.SERVER_ERROR message
	 * @param {string} commandName
	 * @param {number} status
	 * @param {string} statusText
	 * @returns {string}
	 */
	suitestServerError: (commandName, status, statusText) => {
		if (status === 403) {
			return module.exports.notWhitelistedIp();
		}

		return `Server error occurred${commandName ? ` while executing .${commandName} function`: ''}. ${status} - ${statusText}`;
	},

	applicationCommandMalformed: () => 'Invalid input - application command is malformed',
	incorrectElementIndex: () => 'the "index" supplied to the .element() selector should be > 0',
	assertElementMalformed: () => 'Assert element line is malformed',
	videoMalformed: () => 'Video line is malformed',
	psVideoMalformed: () => 'PlayStation Video line is malformed',

	positionIsMalformed: () => 'position command is malformed',
	relativePositionIsMalformed: () => 'relative position is malformed',
	assertOcrMalformed: () => 'Assert ocr line is malformed - comparators are missing',
	imageMalformed: () => 'Image line is malformed',

	unusedLeaves: leaves => `Some of your Suitest chains were not executed.
Put an "await" in front of those chains or call .abandon() to suppress these warnings.
${leaves}`,

	// test launcher
	launcherGreeting: (version) => {
		const offsetInHours = (new Date()).getTimezoneOffset() / 60;

		return '' +
		`Hi there! This is Suitest test launcher v${version}.\n` +
		'Preparing to start execution ...\n' +
		`← Time logs are provided in local time zone (UTC${offsetInHours > 0 ? '-' : '+'}${Math.abs(offsetInHours)})\n\n`;
	},

	launcherSummary: (testCommand, executionLog, ...devices) => {
		return '' +
			`Test command: ${testCommand}\n` +
			(executionLog ? `Log directory: ${executionLog}\n` : '') +
			'Devices: \n' +
			`  - ${devices.join('\n  - ')}\n` +
			'TIP: Assertions are marked with "A", chain evaluations are marked with "E", application console logs are marked as "AL".\n';
	},

	fileLogSummary: (testCommand, orgId, appConfigId, startTime) => {
		return '' +
			'Suitest test execution log\n' +
			'--------------------------\n\n' +
			`- Date ${startTime}.\n` +
			`- Organization ID: ${orgId}\n` +
			`- App config ID: ${appConfigId}\n` +
			`- Test command: ${testCommand}\n\n\n`;
	},

	fileLogCompleted: (exitCode, signal) => {
		const separator = '\n--------------------------\n';

		if (signal)
			return `${separator}Execution interrupted with ${signal}.`;

		return exitCode?
			`${separator}Test failed with error. Exit code(${exitCode})`
			:
			`${separator}Test completed successfully.`;
	},

	launcherWrongDeviceId: template`The deviceId ${0} is unknown. Device may have been deleted.`,

	'tl.noArguments': () => 'Command was not specified',
	'tl.seeMoreCommandsOptions': template`Run ${0} to see those commands options`,
	'tl.finishedWithErrors': () => 'Some executions finished with errors',
	'tl.finishedWithSuccess': () => 'All executions finished successfully',
	'tl.failedToCreateDir': (code, path) => `${code} error occurred while creating a new directory "${path}"`,
	'tl.createDirPermissionDenied': (path) => `Cannot create log file (${path}) Permission denied`,
	'tl.executionMode': template`Execution mode: `,
	'tl.cmdAttributionTip': template`\nTIP: Assertions are marked with "A", chain evaluations are marked with "E".`,
	'tl.logDirDescription': () => 'If defined, additional logging to specified folder will be performed.',
	'tl.inspectOnlyForSingleDevice': () => 'Please connect to single device to enable debugging.',
	'tl.differentLauncherAndLibVersions': template`The version of suitest library (${0}) provided from your script is different from suitest launcher (${1})`,
	'tl.newVersionAvailable': template`New version (${0}) of Suitest JavaScript API is out, please upgrade: \`npm i suitest-js-api\``,

	// error messages
	'errorType.syntaxError.modifierMissing': template`${0} chain missing modifier.`,
	'errorType.suitestCommand': () => 'provided for suitest-js-api running options. It',
	'errorType.suitestTestCommand': () => `Seems you forgot to provide a test command${EOL}check https://suite.st/docs/suitest-api/test-launcher/#usage for more info`,
	'errorType.testCannotBeFetched': (testId, mainTest) => `Test cannot be fetched test id: ${mainTest ? mainTest + ' > ... > ' + testId : testId}`,
	'errorType.noDevices': () => 'There are no devices associated with current configuration',
	'errorType.specifyRunningDevices': () => 'Please specify Configuration id and device id, or presets',
	'errorType.notFoundPresets': (notFoundPresets) => `Presets ${notFoundPresets.join(', ')} were not found in your configuration`,

	'commandError.notSupportedPlatform': () => 'Screenshots are not supported on this device.',
	'commandError.timeout': () => 'Failed to take a screenshot due to timeout.',
	'commandError.generalError': () => 'Failed to take a screenshot.',
	'commandError.notSupportedDriver': () => 'Screenshots are not supported on this driver.',
	'commandError.screenshotFailed': () => 'Error while taking screenshot of device. Saved file does not exists or is not readable.',
	'commandError.notSupportedConfiguration': () => 'Screenshots are not supported with this configuration.',

	executorStopped: () => 'Test execution was stopped. See our documentation for possible reasons: https://suite.st/docs/error-messages/results-errors/#test-execution-was-stopped',

	executionAborted: () => 'Test execution was aborted.',

	maxTestExecutionTimeExceededMessage: () => 'Session execution time limit exceeded.',

	// ipc
	ipcFailedToCreateServer: template`Failed to create IPC server. Port ${0} is busy.`,

	// logger msg
	sessionOpen: () => 'Connecting to Suitest ...',
	sessionOpened: () => 'Connected to Suitest',
	sessionClosing: () => 'Disconnecting from Suitest',
	sessionClosed: () => 'Disconnected from Suitest',

	connectingToDevice: (name, id) => `Connecting to "${name}" (${id})`,
	connectedToDevice: (name, id) => `Connected to "${name}" (${id})`,

	usingAppConfig: (id) => `Setting app configuration id: ${id}`,
	usedAppConfig: (id) => `Will use app configuration id: ${id}`,
	useAppConfigOverrides: () => 'Will apply configuration overrides',
	getAppConfigError: () => 'getAppConfig was called before configId initialization',

	disconnectedFromDevice: () => 'Disconnected from device',
	disconnectingFromDevice: () => 'Disconnecting from device',

	replWarn: () => 'Ignored the "startREPL" command. This command works only for single device.',
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
	replFilesChanged: template`\nFiles changed. Running repeater function:\n${0}\n`,
	replFailedToRequire: template`Failed to require file ${0}. (You may need to update your "watch" parameter)`,
	replIpcErrorInChildProcess: template`IPC error in child process `,
	replIpcNotImplemented: template`IPC protocol not implemented for message: ${0}`,
	replIpcNotAvailable: template`suitest.startREPL() command only works when used together with Suitest launcher.`,
	replFailedToFindRepeater: template`Error: Failed to find the repeater "${0}".`,
	replRepeaterNotAFunc: template`Error: Repeater "${0}" is not a function. Value: ${1}`,
	replNotATty: template`You seem to be using suitest from a CLI that is not a TTY. Some features of suitest.startREPL command may not work as expected. In case of problems try switching to the default system's CLI program, like bash on Linux or cmd on Windows. Sometimes replacing "suitest" command with "node node_modules/suitest-js-api/lib/testLauncher/" could help as well`,
	replWrongNodeVersion: template`Error: To use "suitest.startREPL" you need NodeJS version v9.4 or newer. You are using ${0}. Please update.`,

	// Cli args
	cliLogLevel: () => `Logger verbosity level [default: "${logLevels.normal}"]`,
	cliDisallowCrashReports: () => 'Disallow Suitest to submit automatic crash reports when unexpected exceptions occur',
	defaultTimeout: () => 'Globally set timeout value in milliseconds. Equals to 2000 when left out.',
	cliTimestamp: () => `Logger timestamp format. Use "${timestamp.none}" to disable. [default: "${timestamp.default}"]. This string is processed with momentJS.`,
	cliConfig: () => 'Config file to override default config.',
	cliRecordingOption: () => 'Enables recording of test session',
	startRecordingMessage: (recordingUrl) => `Recording started. Recording URL: ${recordingUrl}`,
	recordingUrlInfo: (recordingUrl) => `Recording URL: ${recordingUrl}`,
	stopRecordingMessage: () => 'Recording stopped',
};
