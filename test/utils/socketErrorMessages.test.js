/* eslint-disable max-len */

const assert = require('assert');
const {set, lensPath} = require('ramda');
const {EOL} = require('os');
const {
	errorMap,
	getErrorMessage,
	responseMessageCode,
	responseMessageInfo,
} = require('../../lib/utils/socketErrorMessages');

describe('Socket error messages', () => {
	it('test response message getters', () => {
		assert.equal(responseMessageInfo({message: {info: 'test'}}), 'test');
		assert.equal(responseMessageCode({message: {code: 'test'}}), 'test');
	});

	it('All properties in errorMap should be functions', () => {
		for (const handler of Object.values(errorMap)) {
			assert.ok(typeof handler === 'function');
		}
	});

	it('All errorMap handlers should returns string', () => {
		const toString = () => '';
		const chainData = {};
		const response = {};

		for (const handler of Object.values(errorMap)) {
			const message = handler({
				chainData,
				toString,
				response,
			});

			assert.ok(typeof message === 'string');
		}
	});

	it('Error message getter should fails', () => {
		assert.throws(getErrorMessage);
		assert.throws(() => getErrorMessage({}));
	});

	it('Error message getter should return default messages', () => {
		const response = {errorType: 'unknownError'};
		const toString = () => 'Chain description';
		const chainData = {};

		assert.equal(getErrorMessage({
			response,
			toString,
			chainData,
		}), 'unknownError: "Chain description"');

		assert.equal(getErrorMessage({
			response: {
				...response,
				errors: 'Some errors',
			},
			toString,
			chainData,
		}), `unknownError: "Chain description"${EOL}errors: "Some errors"`);
	});

	it('Error message should return specific messages', () => {
		const toString = () => 'Chain description';
		const chainData = {};
		const basePayload = (errorType = '', code, reason) => {
			let payload = {
				response: {errorType},
				toString,
				chainData,
			};

			if (code !== void 0) {
				payload = set(lensPath(['response', 'message', 'code']), code, payload);
			}

			if (reason !== void 0) {
				payload = set(lensPath(['response', 'message', 'info', 'reason']), reason, payload);
			}

			return payload;
		};

		[
			[basePayload('failedStart'), 'Chain description'],
			[basePayload('missingApp'), 'Application is not installed on the device.'],
			[basePayload('initPlatformFailed'), 'Failed to initialize device (Suitest base application). Chain description'],
			[basePayload('packageNotFound'), 'Missing package for selected configuration.'],
			[basePayload('missingPackage'), 'Missing package for selected configuration.'],
			[basePayload('internalError'), 'Internal error occurred. Chain description'],
			[basePayload('ILInternalError'), 'Internal error occurred. Chain description'],
			[basePayload('queryTimeout'), 'Application did not respond for 60 seconds. Chain description'],
			[basePayload('serverError'), 'Server error occurred. Chain description'],
			[basePayload('invalidCredentials'), 'Credentials for this device were changed.'],
			[basePayload('syntaxError'), 'Test line is malformed. Chain description'],
			[basePayload('syntaxError', 'WrongDelay'), 'Test line is malformed. Delay value is invalid. Chain description'],
			[basePayload('syntaxError', 'wrongBody'), 'Body field value is exceeding 4KB limit. Chain description'],
			[basePayload('syntaxError', 'wrongUrl'), 'This does not look like a valid URL. Chain description'],
			[basePayload('invalidInput'), 'Test line is malformed. Chain description'],
			[basePayload('invalidInput', 'lineTypeNotSupported'), 'The line is not supported by this configuration. Chain description'],
			[basePayload('ActionNotAvailable'), 'The line is not supported by this configuration. Chain description'],
			[basePayload('conditionNotSatisfied'), 'Maximum amount of key presses reached. Condition was not satisfied. Chain description'],
			[basePayload('deviceError'), 'Internal error occurred. Chain description'],
			[basePayload('deviceError', 'unsupportedSelector', ''), 'Internal error occurred. Chain description'],
			[basePayload('deviceError', 'unsupportedSelector', 'xpathNotSupported'), 'The element cannot be found, because this device does not support XPath.'],
			[basePayload('deviceError', 'unsupportedSelector', 'cssSelectorInvalid'), 'The element cannot be found, the identifying property css selector is invalid.'],
			[basePayload('wrongApp'), 'Wrong app ID detected'],
			[basePayload('driverException'), 'Device failed'],
			[basePayload('illegalButton'), 'Device does not support selected buttons. Chain description'],
			[basePayload('unsupportedButton'), 'Device does not support selected buttons. Chain description'],
			[basePayload('aborted'), 'Test execution was aborted. Chain description'],
			[basePayload('queryFailed'), 'queryFailed: "Chain description"'],
			[basePayload('queryFailed', 'invalidApp'), 'Wrong app ID detected'],
			[
				{
					...basePayload('queryFailed', 'invalidUrl'),
					response: {
						...basePayload('queryFailed', 'invalidUrl').response,
						actualValue: 'actualUrl',
						expectedValue: 'expectedUrl',
					},
				},
				'App loaded actualUrl instead of the expected expectedUrl. Consider updating the app URL in settings',
			],
			[basePayload('queryFailed', 'applicationError'), 'Application error occurred'],
			[basePayload('queryFailed', 'exprException'), 'An exception undefined was thrown.'],
			[basePayload('queryFailed', 'orderErr'), 'Suitest JS library must be included before any other JS in the HTML file.'],
			[basePayload('queryFailed', 'updateAlert'), 'Suitest JS library is outdated, please download and install newer version.'],
			[basePayload('queryFailed', 'notFunction'), 'Specified code is not a function. Chain description'],
			[basePayload('exit'), 'Application testing was exited'],
			[basePayload('networkError'), 'Chain description'],
			[basePayload('noHasLines'), 'No assertion properties defined. Chain description'],
			[basePayload('appCrashed'), 'App seems to have crashed. Chain description'],
			[basePayload('timeLimitExceeded'), 'Time limit has been exceeded. Chain description'],
			[basePayload('notResponding'), 'Device stopped responding'],
			[basePayload('suitestifyError'), 'Suitestify failed to start. Check your Suitestify settings.'],
			[basePayload('suitestifyRequired'), 'Suitestify must be configured in order to use this type of assertion.'],
			[basePayload('invalidVariable'), 'Configuration variables are not defined.'],
			[basePayload('appRunning'), 'App is still running'],
			[
				set(lensPath(['chainData']), {
					type: 'press',
					repeat: 4,
				}, basePayload('appRunning')),
				`App is still running${EOL}Maximum amount of key presses 4 reached. Condition was not satisfied`,
			],
			[basePayload('bootstrapPageNotDetected'), 'App seems to have exited correctly but something went wrong when loading the Suitest channel autostart application.'],
			[basePayload('wrongAppDetected'), 'App seems to have exited correctly, however another app has been opened.'],
			[
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('notExpectedResponse')),
				'Unexpected response received while polling some-url. Chain description',
			],
			[
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('noConnection')),
				'Could not connect to server while polling some-url. Chain description',
			],
			[
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('invalidResult')),
				'Unexpected response received while polling some-url. Chain description',
			],
			[
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('invalidResult', 'resultTooLong')),
				'Response exceeded the size limit of 4KB while polling some-url. Chain description',
			],
			[basePayload('lateManualLaunch'), 'For this platform, open app lines are only allowed at the beginning of the test.'],
			[basePayload('launchExpired'), 'Identical scheduling aborted'],
			[basePayload('deviceIsBusy'), 'Identical scheduling aborted'],
			[basePayload('notActiveDeveloperMode'), 'Failed to launch application. Is "developer mode" turned on?'],
			[basePayload('invalidUrl'), 'Application could not be launched. Please verify you have provided URL for this configuration.'],
			[basePayload('invalidRepositoryReference'), 'Chain description'],
			[
				basePayload('invalidRepositoryReference', 'notExistingElement'),
				'Element was not found in repository. Chain description',
			],
			[
				set(lensPath(['response', 'message', 'property']), 'someProp', basePayload('invalidRepositoryReference', 'unknownProperty')),
				'This element does not support property someProp'],
			[basePayload('invalidRepositoryReference', 'notExistingPlatform'), 'Element is not defined for selected platform. Chain description'],
			[basePayload('openAppOverrideFailed'), 'Open app override failed'],
			[basePayload('Success'), 'The command executed successfully'],
			[basePayload('NoSuchElement'), 'An element could not be located on the page using the given search parameters. Chain description'],
			[basePayload('NoSuchFrame'), 'A request to switch to a frame could not be satisfied because the frame could not be found. Chain description'],
			[basePayload('UnknownCommand'), 'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource. Chain description'],
			[basePayload('StaleElementReference'), 'An element command failed because the referenced element is no longer attached to the DOM. Chain description'],
			[basePayload('ElementNotVisible'), 'An element command could not be completed because the element is not visible on the page. Chain description'],
			[basePayload('InvalidElementState'), 'An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element). Chain description'],
			[basePayload('UnknownError'), 'An unknown server-side error occurred while processing the command. Chain description'],
			[basePayload('ElementIsNotSelectable'), 'An attempt was made to select an element that cannot be selected. Chain description'],
			[basePayload('JavaScriptError'), 'An error occurred while executing user supplied JavaScript. Chain description'],
			[basePayload('XPathLookupError'), 'An error occurred while searching for an element by XPath. Chain description'],
			[basePayload('Timeout'), 'An operation did not complete before its timeout expired. Chain description'],
			[basePayload('NoSuchWindow'), 'A request to switch to a different window could not be satisfied because the window could not be found. Chain description'],
			[basePayload('InvalidCookieDomain'), 'An illegal attempt was made to set a cookie under a different domain than the current page. Chain description'],
			[basePayload('UnableToSetCookie'), 'A request to set a cookie\'s value could not be satisfied. Chain description'],
			[basePayload('UnexpectedAlertOpen'), 'A modal dialog was open, blocking this operation. Chain description'],
			[basePayload('NoAlertOpenError'), 'There was no modal dialog on the page. Chain description'],
			[basePayload('ScriptTimeout'), 'A script did not complete before its timeout expired. Chain description'],
			[basePayload('InvalidElementCoordinates'), 'The coordinates provided to an interactions operation are invalid. Chain description'],
			[basePayload('IMENotAvailable'), 'IME was not available.'],
			[basePayload('IMEEngineActivationFailed'), 'An IME engine could not be started.'],
			[basePayload('InvalidSelector'), 'Argument was an invalid selector (e.g. XPath/CSS). Chain description'],
			[basePayload('unknownWebDriverKey'), 'Unable to send a key to the device'],
			[basePayload('unfocusableElement'), 'Element can\'t receive focus to enter text. Chain description'],
			[basePayload('unclickableElement'), 'Element click is obstucted by different element. Chain description'],
			[basePayload('appiumInstanceError'), 'Failed to initialize device control.'],
			[basePayload('deviceConnectionError'), 'Failed to initialize device control.'],
			[
				set(lensPath(['response', 'message', 'info', 'currentLandingActivity']), 'some.android.activity', basePayload('landingActivityTimeoutError')),
				'We have waited for the requested activity to open, but instead the some.android.activity was started. Please check the configuration settings.',
			],
		].forEach(([payload, expectMessage]) => {
			assert.equal(getErrorMessage(payload), expectMessage, JSON.stringify(payload, null, 4));
		});
	});
});
