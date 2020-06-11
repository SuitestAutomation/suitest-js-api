/* eslint-disable max-len */

const assert = require('assert');
const {set, lensPath} = require('ramda');
const {EOL} = require('os');
const {stripAnsiChars} = require('../../lib/utils/stringUtils');
const {
	errorMap,
	getErrorMessage,
	getInfoErrorMessage,
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
		const response = {};
		const jsonMessage = {};

		for (const key of Object.keys(errorMap)) {
			const handler = errorMap[key];
			const message = handler({
				toString,
				response: key === 'adbError' ? {
					message: {
						info: {
							reason: 'reason',
						},
					},
				} : response,
				jsonMessage,
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
		const jsonMessage = {};

		assert.equal(getErrorMessage({
			response,
			toString,
			jsonMessage,
		}), 'unknownError: "Chain description."');

		assert.equal(getErrorMessage({
			response: {
				...response,
				errors: 'Some errors',
			},
			toString,
			jsonMessage,
		}), `unknownError: "Chain description."${EOL}errors: "Some errors"`);
	});

	describe('Error message should return specific messages', () => {
		const toString = (jsonMessage, nameOnly) => nameOnly ? 'Element name' : 'Chain description';
		const jsonMessage = {};
		const basePayload = (errorType, code, reason) => {
			let payload = {
				response: {errorType},
				toString,
				jsonMessage,
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
			[basePayload('failedStart'), 'Chain description.'],
			[basePayload('missingApp'), 'Application is not installed on the device.'],
			[basePayload('outdatedLibrary'), 'We have detected that your instrumentation library is outdated and the package cannot be opened. Update required.'],
			[basePayload('initPlatformFailed'), 'Failed to start Suitest bootstrap application on this device.'],
			[basePayload('packageNotFound'), 'There is nothing to test, because the selected configuration does not contain an app package. Upload a package on your app\'s configuration page before continuing.'],
			[basePayload('internalError'), 'Internal error occurred. Chain description.'],
			[basePayload('ILInternalError'), 'Internal error occurred. Chain description.'],
			[basePayload('queryTimeout'), 'Application did not respond for 60 seconds. Executing "Chain description.".'],
			[
				set(lensPath(['response', 'message', 'info', 'timeout']), 3000, basePayload('queryTimeout', 'missingILResponse')),
				'The wait time exceeded 3 seconds. Executing "Chain description.".',
			],
			[
				set(lensPath(['response', 'message', 'info', 'timeout']), 1000, basePayload('queryTimeout', 'missingILResponse')),
				'The wait time exceeded 1 second. Executing "Chain description.".',
			],
			[
				set(lensPath(['response', 'message', 'info', 'timeout']), 500, basePayload('queryTimeout', 'missingILResponse')),
				'The wait time exceeded 0.5 seconds. Executing "Chain description.".',
			],
			[basePayload('serverError'), 'Server error occurred. Chain description.'],
			[basePayload('invalidCredentials'), 'Credentials for this device were changed.'],
			[basePayload('syntaxError'), 'Test command received invalid input. Chain description.'],
			[basePayload('syntaxError', 'WrongDelay'), 'Test command received invalid input. Delay value is invalid. Chain description.'],
			[basePayload('syntaxError', 'wrongBody'), 'Body field value is exceeding 4KB limit. Chain description.'],
			[basePayload('syntaxError', 'wrongUrl'), 'This does not look like a valid URL. Chain description.'],
			[basePayload('invalidInput'), 'Test command received invalid input. Chain description.'],
			[basePayload('invalidInput', 'lineTypeNotSupported'), 'This test command is not supported by the current app configuration. Chain description.'],
			[
				{
					...basePayload('invalidInput', 'elementNotSupported'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'click',
							target: {
								type: 'element',
								val: {
									css: 'test',
								},
							},
							clicks: [
								{
									type: 'single',
									button: 'left',
								},
							],
							count: 1,
							delay: 1,
						},
					},
				},
				'Chain description. .click() is unsupported by this element.',
			],
			[
				{
					...basePayload('invalidInput', 'elementNotSupported'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'setText',
							target: {
								type: 'element',
								val: {
									css: 'test',
								},
							},
							val: 'set text value',
						},
					},
				},
				'Chain description. .setText() is unsupported by this element.',
			],
			[basePayload('ActionNotAvailable'), 'This test command is not supported by the current app configuration. Chain description.'],
			[
				{
					...basePayload('conditionNotSatisfied'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'button',
							ids: [
								'ENTER',
							],
							count: 4,
							delay: 1,
						},
					},
				},
				'Maximum amount of key presses 4 reached. Condition was not satisfied. Chain description.',
			],
			[basePayload('deviceError'), 'Internal error occurred. Chain description.'],
			[basePayload('deviceError', 'unsupportedSelector', ''), 'Internal error occurred. Chain description.'],
			[basePayload('deviceError', 'unsupportedSelector', 'xpathNotSupported'), 'Element cannot be found, because this device does not support XPath lookups.'],
			[basePayload('deviceError', 'deviceFailure', 'cssSelectorInvalid'), 'CSS selector is invalid.'],
			[basePayload('deviceError', 'videoAdapterInvalidOutput', 'some explanation from IL'), 'Video adapter error: some explanation from IL.'],
			[basePayload('deviceError', 'videoAdapterNotFunction', 'some explanation from IL'), 'Video adapter error: some explanation from IL.'],
			[basePayload('deviceError', 'videoAdapterThrownError', 'some explanation from IL'), 'Video adapter error: some explanation from IL.'],
			[basePayload('wrongApp'), 'Wrong app ID detected'],
			[basePayload('driverException'), 'Unexpected exception occurred on connected device. Please, contact support@suite.st if you see this often.'],
			[basePayload('illegalButton'), 'Specified buttons are not supported on this device. Chain description.'],
			[basePayload('unsupportedButton'), 'Specified buttons are not supported on this device. Chain description.'],
			[basePayload('aborted'), 'Test execution was aborted. Chain description.'],
			[basePayload('aborted', undefined, 'manualActionRequired'), 'Manual actions are not supported.'],
			[
				{
					...basePayload('queryFailed'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'button',
							ids: [
								'ENTER',
							],
							count: 4,
							delay: 1,
						},
					},
				},
				'Maximum amount of key presses 4 reached. Condition was not satisfied. Chain description.',
			],
			[basePayload('queryFailed'), 'queryFailed: "Chain description."'],
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
				'App loaded actualUrl instead of the expected expectedUrl. Consider updating the app URL in settings.'
				+ `${EOL}\tFailing checks:`
				+ `${EOL}\t~ expectedUrl (expected)`
				+ `${EOL}\t× actualUrl (actual)${EOL}\t`,
			],
			[
				{
					...basePayload('queryFailed'),
					response: {
						errorType: 'queryFailed',
						errors: [{'type': 'noUriFound'}],
					},
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'wait',
							condition: {
								subject: {
									type: 'network',
									compare: '=',
									val: 'test',
									requestInfo: [],
									responseInfo: [],
								},
								type: 'made',
								searchStrategy: 'all',
							},
							timeout: 2000,
						},
					},
				},
				'queryFailed: "Chain description."'
				+ `${EOL}\tFailing checks:`
				+ `${EOL}\t~ url: test (expected)`
				+ `${EOL}\t× url: request was not made (actual)`,
			],
			[
				{
					...basePayload('queryFailed'),
					response: {
						errorType: 'queryFailed',
						errors: [{
							type: 'header',
							name: 'testHeader',
							actualValue: 'testActualVal',
							message: 'request',
						}, {
							type: 'method',
							actualValue: 'POST',
							message: 'request',
						}, {
							type: 'body',
							reason: 'notFound',
							message: 'response',
						}, {
							type: 'status',
							message: 'response',
						}, {
							type: 'header',
							message: 'response',
							name: 'not in chain data, will be ignored',
						}],
					},
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'wait',
							condition: {
								subject: {
									type: 'network',
									compare: '=',
									val: 'test',
									requestInfo: [
										{
											name: 'testHeader',
											val: 'testExpectedVal',
										},
										{
											name: '@method',
											val: 'GET',
										},
									],
									responseInfo: [
										{
											name: '@body',
											val: 'testBody',
										},
										{
											name: '@status',
											val: 200,
										},
									],
								},
								type: 'made',
								searchStrategy: 'all',
							},
							timeout: 2000,
						},
					},
				},
				'queryFailed: "Chain description."'
				+ `${EOL}\tFailing checks:`
				+ `${EOL}\t~ request header "testHeader": testExpectedVal (expected)`
				+ `${EOL}\t× request header "testHeader": testActualVal (actual)`
				+ `${EOL}\t~ request method: GET (expected)`
				+ `${EOL}\t× request method: POST (actual)`
				+ `${EOL}\t~ response body: testBody (expected)`
				+ `${EOL}\t× response body: not found (actual)`
				+ `${EOL}\t~ response status: 200 (expected)`
				+ `${EOL}\t× response status: unknown (actual)`,
			],
			[basePayload('queryFailed', 'applicationError'), 'Application thrown unexpected error while executing command "Chain description.".'],
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
			[basePayload('queryFailed', 'notFunction'), 'Specified code is not a function. Chain description.'],
			[basePayload('queryFailed', 'psImplicitVideo'), 'The "video" subject on the PlayStation platform is inconsistent, we recommend using the "native video" or "element" subject instead. Read more in docs - ps4-support.psImplicitVideo.'],
			[
				{
					...basePayload('queryFailed', 'missingSubject'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'click',
							target: {
								type: 'element',
								val: {
									css: 'test',
								},
							},
							clicks: [
								{
									type: 'single',
									button: 'left',
								},
							],
							count: 1,
							delay: 1,
						},
					},
				},
				'Element Element name was not found.',
			],
			[
				{
					...basePayload('queryFailed', 'missingSubject'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'wait',
							condition: {
								subject: {
									type: 'element',
									val: {
										css: 'test',
									},
								},
								type: 'exists',
							},
							timeout: 2000,
						},
					},
				},
				'Element Element name was not found.',
			],
			[basePayload('networkError'), 'Chain description.'],
			[basePayload('noHasLines'), 'No assertion properties defined. Chain description.'],
			[basePayload('appCrashed'), 'App seems to have crashed. Chain description.'],
			[basePayload('timeLimitExceeded'), 'Test execution limit exceeded (based on your subscription). Chain description.'],
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
				{
					...basePayload('appRunning'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'button',
							ids: [
								'ENTER',
							],
							count: 4,
							delay: 1,
						},
					},
				},
				'Maximum amount of key presses 4 reached. Condition was not satisfied. Chain description.',
			],
			[basePayload('appNotRunning'), 'Application is not running.'],
			[
				set(lensPath(['response', 'executionError']), 'appNotRunning', basePayload()),
				'Application is not running.',
			],
			[basePayload('bootstrapPageNotDetected'), 'App seems to have exited correctly but something went wrong when loading the Suitest channel autostart application.'],
			[basePayload('wrongAppDetected'), 'App seems to have exited correctly, however another app has been opened.'],
			[
				{
					...basePayload('notExpectedResponse'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'openUrl',
							url: 'some-url',
						},
					},
				},
				'Unexpected response received while polling some-url. Chain description.',
			],
			[
				{
					...basePayload('noConnection'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'openUrl',
							url: 'some-url',
						},
					},
				},
				'Could not connect to server while polling some-url. Chain description.',
			],
			[
				{
					...basePayload('invalidResult'),
					jsonMessage: {
						type: 'eval',
						request: {
							type: 'openUrl',
							url: 'some-url',
						},
					},
				},
				'Unexpected response received while polling some-url. Chain description.',
			],
			[basePayload('lateManualLaunch'), 'In this configuration the "open app" commands inside the test are not supported. You may however start the test with "open app" command.'],
			[basePayload('launchExpired'), 'Identical scheduling aborted.'],
			[basePayload('deviceIsBusy'), 'Identical scheduling aborted.'],
			[basePayload('notActiveDeveloperMode'), 'Failed to launch application. Is "developer mode" turned on?'],
			[basePayload('invalidUrl'), 'Application could not be launched. Please verify you have provided URL for this configuration.'],
			[basePayload('invalidRepositoryReference'), 'Chain description.'],
			[
				set(lensPath(['response', 'message', 'apiId']), 'apiId', basePayload('invalidRepositoryReference', 'notExistingElement')),
				'Element apiId was not found in repository.',
			],
			[
				set(lensPath(['response', 'message']), {
					property: 'someProp',
					apiId: 'apiId',
					code: 'unknownProperty',
				}, basePayload('invalidRepositoryReference')),
				'Element apiId does not support property "someProp".',
			],
			[
				set(lensPath(['response', 'message', 'apiId']), 'apiId', basePayload('invalidRepositoryReference', 'notExistingPlatform')),
				'Element apiId has no defined identifying properties for this platform.',
			],
			[basePayload('openAppOverrideFailed'), 'An error occurred while executing the "Open app override test".'],
			[basePayload('invalidOpenAppOverrideReference'), 'Could not start execution, please check open app override setting. https://suite.st/docs/application/more-configuration-options/#open-app-override-test'],
			[basePayload('Success'), 'Command executed successfully.'],
			[basePayload('NoSuchElement'), 'Element Element name was not found.'],
			[basePayload('NoSuchFrame'), 'Cannot switch to frame Element name.'],
			[basePayload('UnknownCommand'), 'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource. Chain description.'],
			[basePayload('StaleElementReference'), 'Element Element name is no longer inside DOM.'],
			[basePayload('ElementNotVisible'), 'Element Element name is not currently visible.'],
			[basePayload('InvalidElementState'), 'Cannot perform operation with element Element name because this element is in an invalid state (e.g. attempting to click a disabled element).'],
			[basePayload('UnknownError'), 'UnknownError: "Chain description."'],
			[basePayload('ElementIsNotSelectable'), 'Element Element name is not selectable.'],
			[basePayload('XPathLookupError'), 'XPath error occurred when searching for Element name.'],
			[basePayload('Timeout'), 'This command takes too long to execute. Chain description.'],
			[basePayload('NoSuchWindow'), 'A request to switch to a different window could not be satisfied because the window could not be found. Chain description.'],
			[basePayload('InvalidCookieDomain'), 'Cannot set a cookie on a domain different from the current page. Chain description.'],
			[basePayload('UnableToSetCookie'), 'Cannot set the specified cookie value. Chain description.'],
			[basePayload('UnexpectedAlertOpen'), 'A modal dialog was open, blocking this operation. Chain description.'],
			[basePayload('NoAlertOpenError'), 'There was no modal dialog on the page. Chain description.'],
			[basePayload('ScriptTimeout'), 'A script takes too long to execute. Chain description.'],
			[basePayload('InvalidElementCoordinates'), 'Invalid coordinates specified for Element name.'],
			[basePayload('IMENotAvailable'), 'IME was not available.'],
			[basePayload('IMEEngineActivationFailed'), 'An IME engine could not be started.'],
			[basePayload('InvalidSelector'), 'This selector is malformed. Chain description.'],
			[basePayload('ElementNotInteractable'), 'Element is not currently interactable and may not be manipulated.'],
			[basePayload('unknownWebDriverKey'), 'This key is not supported on the target device.'],
			[basePayload('unfocusableElement'), 'Element Element name is not designed to receive any text input.'],
			[basePayload('unclickableElement'), 'Cannot click on Element name because the element is obstructed by another element.'],
			[basePayload('deviceConnectionError'), 'Failed to initialize device control.'],
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
			[basePayload('signInRequired'), 'Account needs to be signed in on target device.'],
			[basePayload('appleError65'), 'Failed to launch app: Apple ID account error - see https://suite.st/docs/devices/apple-tv/#apple-id-account-error.'],
			[basePayload('appleError70'), 'Failed to launch app: Xcode error - see https://suite.st/docs/devices/apple-tv/#xcode-error.'],
			[basePayload('appleAppSignError'), 'Failed to launch app: App code sign error - see https://suite.st/docs/devices/apple-tv/#app-code-sign-error.'],
			[basePayload('invalidPackage', 'appleTvSimPackageOnDevice'), 'An Apple TV app simulator package cannot be launched on real device.'],
			[basePayload('invalidPackage', 'appleTvDevicePackageOnSim'), 'An Apple TV app package cannot be launched on simulator device.'],
			[basePayload('missingPSSDK'), 'Please make sure that you have the PlayStation SDK installed. Please see our docs - https://suite.st/docs/troubleshooting/playstation/#playstation-sdk-not-installed.'],
			[basePayload('targetManagerBusy'), 'Please try again in a few minutes.'],
			[basePayload('missingDotNet'), 'Please make sure you have the .NET Framework installed. Please see our docs - https://suite.st/docs/troubleshooting/playstation/#net-framework-not-installed.'],
			[basePayload('bootstrapAppNotDetected'), 'The Suitest bootstrap application was not detected.'],
			[basePayload('activationExpired'), 'Could not open the app because the DevKit/TestKit expired.'],
			[basePayload('missingCpp'), 'Make sure you have Microsoft Visual C++ Redistributable installed. Please see our docs - https://suite.st/docs/devices/playstation.'],
			[
				{
					...basePayload('testSnippetError'),
					jsonMessage: {
						request: {
							val: 'testId',
						},
					},
				},
				'Test run by ID "testId" failed.',
			],
			[
				{
					...basePayload('invalidReference'),
					jsonMessage: {
						request: {
							val: 'testId',
						},
					},
				},
				'Test with ID "testId" does not exist.',
			],
			[basePayload('outdatedLibraryWarning'), 'We have detected that your instrumentation library is outdated, the package can still be opened. Consider updating.'],
			[basePayload('adbError', undefined, 'testReason'), 'testReason'],
			[basePayload('adbError'), 'ADB communication with the device has failed. Make sure your device is set up correctly and it can be connected to using ADB.'],
			[basePayload('outOfMemory'), 'Failed to open the app. Device is out of memory, please restart the device.'],
			[basePayload('configuratorError'), 'Make sure that Apple Configurator 2 and Automation Tools are installed. Please see our docs.'],
			[basePayload('appStoreBuild'), 'Can’t install App Store distribution build.'],
			[basePayload('ioError'), 'Problem with storing data. Please check that there is enough disk space and that permissions are not limited. Contact support (mailto:support@suite.st) if problem persists.'],
			[basePayload('netError'), 'Downloading of the driver failed, please check your internet connection and try again later. Contact support (mailto:support@suite.st) if problem persists.'],
			[basePayload('sdComponentFailed'), 'Downloading of the driver failed, please try again later. Contact support (mailto:support@suite.st) if problem persists.'],
		].forEach(([payload, expectMessage]) => {
			it(expectMessage, () => {
				assert.strictEqual(stripAnsiChars(getErrorMessage(payload)), expectMessage, JSON.stringify(payload, null, 4));
			});
		});
	});

	it('should test getInfoErrorMessage', () => {
		const msg1 = getInfoErrorMessage(
			'message',
			'prefix ',
			{errorType: 'testIsNotStarted'},
			'stack\n\tat line1\n\tat line2').replace(/\r/gm, '');

		assert.strictEqual(
			msg1,
			'prefix message Test session will now close and all remaining Suitest commands will fail. To allow execution of remaining Suitest commands call suitest.startTest() or fix this error.\n\tat line1',
		);

		const msg2 = getInfoErrorMessage('message', 'prefix ', {
			result: 'fatal',
		}, 'stack\n\tat line1\n\tat line2').replace(/\r/gm, '');

		assert.strictEqual(
			msg2,
			'prefix message Test session will now close and all remaining Suitest commands will fail. To allow execution of remaining Suitest commands call suitest.startTest() or fix this error.\n\tat line1'
		);

		const msg3 = getInfoErrorMessage(
			'message',
			'prefix ',
			{},
			'stack\n\tat line1\n\tat line2'
		).replace(/\r/gm, '');

		assert.strictEqual(msg3, 'prefix message\n\tat line1');

		const msg4 = getInfoErrorMessage(
			'message' + EOL,
			'prefix ',
			{},
			'stack\n\tat line1\n\tat line2'
		);

		assert.strictEqual(msg4, 'prefix message' + EOL + '\tat line1');
	});
});
