/* eslint max-len: 0 */

const {sep} = require('path');
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

	unknownError: () => 'Unknown Suitest error occurred. Our developers are notified if sentry option is turned on. If Error repeats, please contact us via support@suite.st.',
	// Auth errors
	authNotAllowed: commandName => `You're not allowed to execute .${commandName} function. Make sure you're logged in with the correct credentials.`,
	authFailed: () => 'Authentication failed. Make sure you\'re trying to login with correct credentials.',

	// General validation
	invalidInput: () => 'Invalid input',
	invalidInputMessage: (methodName, field) =>
		`provided for .${methodName} function.` + (field ? ` ${field}` : ''),
	invalidConfigObj: () => 'provided for configuration object.',

	// WebSockets errors
	wsNotConnected: () => 'WebSocket connection with Suitest server is not established. Make sure you\'re logged in with correct credentials and your network is up.',

	// Other
	failedStackTrace: () => 'Failed to fetch stack trace',
	invalidUntilChain: template`Until condition chain requires valid modifier and should be one of the following types:\n${0}`,
	chainExpected: () => 'Until condition expects a chain as an input parameter',

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
	element: template`Get ${0} element properties`,
	elementExist: template`Check if ${0} element exists`,
	elementMatchJS: template`Check if ${0} element matches JavaScript expression`,
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
	unusedLeaves: leaves => `It seems that some of your Suitest chains were never executed.
Did you forget an "await"? If that's by design, make sure you call .abandon() after you're done with the chain to suppress this warning.
List of non-executed chains:
${leaves}`,

	// test launcher
	'tl.nodevices': () => 'there is no device in config to proceed with testing',
	'tl.finishedWithErrors': () => 'Some executions finished with errors',
	'tl.finishedWithSuccess': () => 'All executions finished successfully',
	'tl.promptPassword': () => 'Please enter your passwod: ',
	'tl.failedToCreateDir': () => 'Unknown error occurred while creating a new directory',
	'tl.createDirPermissionDenied': (path) => `Cannot create log file (${path}) Permission denied`,
	'tl.startLogRecording': (dir, device) => `Logs for device: ${device}${EOL}Will be written to ${dir}${sep}${device}.log.`,
	'tl.logDirDescription': () => 'If defined, additional logging to specified folder will be performed.',

	// error messages
	'err.msg.appRunning': () => 'App is still running',
	'err.msg.conditionNotSatisfied': count => `Maximum amount of key presses ${count} reached. Condition was not satisfied`,
	'err.msg.appNotRunning': () => 'Application is not running',

	// Warnings
	warnConfigureDeprication: () => '.configure() command is deprecated and will be removed soon. Use .suitestrc file or cli args for configuration.',
};
