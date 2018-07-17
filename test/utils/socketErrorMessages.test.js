/* eslint-disable max-len */

const assert = require('assert');
const {set, lensPath} = require('ramda');
const {EOL} = require('os');
const {stripAnsiChars} = require('../../lib/utils/stringUtils');
const {
	errorMap,
	getErrorMessage,
	responseMessageCode,
	responseMessageInfo,
	getErrorType,
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
		const basePayload = (errorType, code, reason) => {
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
			[basePayload('initPlatformFailed'), 'Failed to start Suitest bootstrap application on this device.'],
			[basePayload('packageNotFound'), 'There is nothing to test, because the selected configuration does not contain an app package. Upload a package on your app\'s configuration page before continuing.'],
			[basePayload('missingPackage'), 'There is nothing to test, because the selected configuration does not contain an app package. Upload a package on your app\'s configuration page before continuing.'],
			[basePayload('internalError'), 'Internal error occurred. Chain description'],
			[basePayload('ILInternalError'), 'Internal error occurred. Chain description'],
			[basePayload('queryTimeout'), 'Application did not respond for 60 seconds. Chain description'],
			[basePayload('serverError'), 'Server error occurred. Chain description'],
			[basePayload('invalidCredentials'), 'Credentials for this device were changed.'],
			[basePayload('syntaxError'), 'Test command received invalid input. Chain description'],
			[basePayload('syntaxError', 'WrongDelay'), 'Test command received invalid input. Delay value is invalid. Chain description'],
			[basePayload('syntaxError', 'wrongBody'), 'Body field value is exceeding 4KB limit. Chain description'],
			[basePayload('syntaxError', 'wrongUrl'), 'This does not look like a valid URL. Chain description'],
			[basePayload('invalidInput'), 'Test command received invalid input. Chain description'],
			[basePayload('invalidInput', 'lineTypeNotSupported'), 'This test command is not supported by the current app configuration. Chain description'],
			[basePayload('ActionNotAvailable'), 'This test command is not supported by the current app configuration. Chain description'],
			[
				set(lensPath(['chainData']), {
					type: 'press',
					repeat: 4,
				}, basePayload('conditionNotSatisfied')),
				'Maximum amount of key presses 4 reached. Condition was not satisfied. Chain description',
			],
			[basePayload('deviceError'), 'Internal error occurred. Chain description'],
			[basePayload('deviceError', 'unsupportedSelector', ''), 'Internal error occurred. Chain description'],
			[basePayload('deviceError', 'unsupportedSelector', 'xpathNotSupported'), 'The element cannot be found, because this device does not support XPath.'],
			[basePayload('deviceError', 'deviceFailure', 'cssSelectorInvalid'), 'The element cannot be found, the identifying property css selector is invalid.'],
			[basePayload('deviceError', 'videoAdapterInvalidOutput', 'some explanation from IL'), 'Video adapter error: some explanation from IL.'],
			[basePayload('deviceError', 'videoAdapterNotFunction', 'some explanation from IL'), 'Video adapter error: some explanation from IL.'],
			[basePayload('deviceError', 'videoAdapterThrownError', 'some explanation from IL'), 'Video adapter error: some explanation from IL.'],
			[basePayload('wrongApp'), 'Wrong app ID detected'],
			[basePayload('driverException'), 'Unexpected exception occurred on connected device. Please, contact support@suite.st if you see this often.'],
			[basePayload('illegalButton'), 'Specified buttons are not supported on this device. Chain description'],
			[basePayload('unsupportedButton'), 'Specified buttons are not supported on this device. Chain description'],
			[basePayload('aborted'), 'Test execution was aborted. Chain description'],
			[
				set(lensPath(['response', 'message', 'info', 'reason']), 'manualActionRequired', basePayload('aborted')),
				'Manual actions are not supported.',
			],
			[
				set(lensPath(['chainData']), {
					type: 'press',
					repeat: 4,
				}, basePayload('queryFailed')),
				'Maximum amount of key presses 4 reached. Condition was not satisfied. Chain description',
			],
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
				'App loaded actualUrl instead of the expected expectedUrl. Consider updating the app URL in settings. Failing checks:'
					+ `${EOL}\t~ expectedUrl (expected)${EOL}\t× actualUrl (actual)${EOL}\t`,
			],
			[basePayload('queryFailed', 'applicationError'), 'Application thrown unexpected error while executing command "Chain description".'],
			[basePayload('queryFailed', 'exprException'), 'JavaScript error: .'],
			[
				set(
					lensPath(['response', 'message', 'info', 'exception']),
					'SomeException',
					basePayload('queryFailed', 'exprException')
				),
				'JavaScript error: SomeException.',
			],
			[basePayload('queryFailed', 'orderErr'), 'Suitest instrumentation library should be placed as the first script in your HTML file. Loading the instrumentation library dynamically or after other scripts have loaded may cause many unusual errors.'],
			[basePayload('queryFailed', 'updateAlert'), 'Suitest instrumentation library is outdated. Please download and install the newest version.'],
			[basePayload('queryFailed', 'notFunction'), 'Specified code is not a function. Chain description'],
			[basePayload('networkError'), 'Chain description'],
			[basePayload('noHasLines'), 'No assertion properties defined. Chain description'],
			[basePayload('appCrashed'), 'App seems to have crashed. Chain description'],
			[basePayload('timeLimitExceeded'), 'Time limit has been exceeded. Chain description'],
			[basePayload('notResponding'), 'Device stopped responding.'],
			[basePayload('suitestifyError'), 'Suitestify failed to start. Check your Suitestify settings.'],
			[basePayload('suitestifyRequired'), 'This assertion only works with Suitestify. You can configure your app to use Suitestify in the app settings. Please note that Suitestify is not available for all platforms.'],
			[basePayload('invalidVariable'), 'Variable is not defined in the app configuration.'],
			[
				set(lensPath(['response', 'args', 'variables']), ['test'], basePayload('invalidVariable')),
				'Variable test is not defined in the app configuration.',
			],
			[
				set(lensPath(['response', 'args', 'variables']), ['test', 'debug'], basePayload('invalidVariable')),
				'Variables test, debug are not defined in the app configuration.',
			],
			[basePayload('appRunning'), 'App is still running.'],
			[
				set(lensPath(['chainData']), {
					type: 'press',
					repeat: 4,
				}, basePayload('appRunning')),
				'Maximum amount of key presses 4 reached. Condition was not satisfied. Chain description',
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
			[basePayload('lateManualLaunch'), 'In this configuration the "open app" commands inside the test are not supported. You may however start the test with "open app" command.'],
			[basePayload('launchExpired'), 'Identical scheduling aborted.'],
			[basePayload('deviceIsBusy'), 'Identical scheduling aborted.'],
			[basePayload('notActiveDeveloperMode'), 'Failed to launch application. Is "developer mode" turned on?'],
			[basePayload('invalidUrl'), 'Application could not be launched. Please verify you have provided URL for this configuration.'],
			[basePayload('invalidRepositoryReference'), 'Chain description'],
			[
				basePayload('invalidRepositoryReference', 'notExistingElement'),
				'Element was not found in repository. Chain description',
			],
			[
				set(lensPath(['response', 'message', 'property']), 'someProp', basePayload('invalidRepositoryReference', 'unknownProperty')),
				'This element does not support property someProp.',
			],
			[basePayload('invalidRepositoryReference', 'notExistingPlatform'), 'Element is not defined for selected platform. Chain description'],
			[basePayload('openAppOverrideFailed'), 'An error occurred while executing the "Open app override test".'],
			[basePayload('Success'), 'Command executed successfully.'],
			[basePayload('NoSuchElement'), 'An element could not be located on the page using the given search parameters. Chain description'],
			[basePayload('NoSuchFrame'), 'A request to switch to a frame could not be satisfied because the frame could not be found. Chain description'],
			[basePayload('UnknownCommand'), 'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource. Chain description'],
			[basePayload('StaleElementReference'), 'Referenced element is no longer in the DOM. Chain description'],
			[basePayload('ElementNotVisible'), 'Referenced element is not visible on the page. Chain description'],
			[basePayload('InvalidElementState'), 'An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element). Chain description'],
			[basePayload('UnknownError'), 'UnknownError: "Chain description"'],
			[basePayload('ElementIsNotSelectable'), 'An attempt was made to select an element that cannot be selected. Chain description'],
			[basePayload('JavaScriptError'), 'An error occurred while executing user supplied JavaScript. Chain description'],
			[basePayload('XPathLookupError'), 'An error occurred while searching for an element by XPath. Chain description'],
			[basePayload('Timeout'), 'This command takes too long to execute. Chain description'],
			[basePayload('NoSuchWindow'), 'A request to switch to a different window could not be satisfied because the window could not be found. Chain description'],
			[basePayload('InvalidCookieDomain'), 'Cannot set a cookie on a domain different from the current page. Chain description'],
			[basePayload('UnableToSetCookie'), 'Cannot set the specified cookie value. Chain description'],
			[basePayload('UnexpectedAlertOpen'), 'A modal dialog was open, blocking this operation. Chain description'],
			[basePayload('NoAlertOpenError'), 'There was no modal dialog on the page. Chain description'],
			[basePayload('ScriptTimeout'), 'A script takes too long to execute. Chain description'],
			[basePayload('InvalidElementCoordinates'), 'The coordinates provided to an interactions operation are invalid. Chain description'],
			[basePayload('IMENotAvailable'), 'IME was not available.'],
			[basePayload('IMEEngineActivationFailed'), 'An IME engine could not be started.'],
			[basePayload('InvalidSelector'), 'This selector is malformed. Chain description'],
			[basePayload('unknownWebDriverKey'), 'This key is not supported on the target device.'],
			[basePayload('unfocusableElement'), 'The target element is not designed to receive any text input. Chain description'],
			[basePayload('unclickableElement'), 'Another element is obstructing the target element, so it cannot be clicked on. Chain description'],
			[basePayload('appiumInstanceError'), 'Failed to initialize device control.'],
			[basePayload('deviceConnectionError'), 'Failed to initialize device control.'],
			[
				set(lensPath(['response', 'message', 'info', 'currentLandingActivity']), 'some.android.activity', basePayload('landingActivityTimeoutError')),
				'We have waited for the requested activity to open, but instead the some.android.activity was started. Please check the configuration settings.',
			],
			[
				set(lensPath(['response']), {
					executeThrowException: true,
					executeExceptionMessage: 'error',
				}, basePayload()),
				'JavaScript expression error: "error".',
			],
			[
				set(lensPath(['response']), {
					matchJSThrowException: true,
					matchJSExceptionMessage: 'error',
				}, basePayload()),
				'JavaScript expression error: "error".',
			],
		].forEach(([payload, expectMessage]) => {
			assert.equal(stripAnsiChars(getErrorMessage(payload)), expectMessage, JSON.stringify(payload, null, 4));
		});
	});

	it('test gerErrorType', () => {
		assert.strictEqual(getErrorType({}), '', 'default');
		assert.strictEqual(getErrorType({errorType: ''}), '', 'empty string');
		assert.strictEqual(getErrorType({errorType: 'errorType'}), 'errorType', 'errorType');
		assert.strictEqual(getErrorType({executeThrowException: true}), 'executeThrowException', 'executeThrowException');
		assert.strictEqual(getErrorType({matchJSThrowException: true}), 'matchJSThrowException', 'matchJSThrowException');
		assert.strictEqual(getErrorType({
			errorType: 'errorType',
			executeThrowException: true,
		}), 'errorType', 'errorType priority');
	});
});
