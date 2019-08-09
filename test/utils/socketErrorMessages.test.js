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
	notStartedReasons,
	getNotStartedReasonMessage,
} = require('../../lib/utils/socketErrorMessages');
const {NETWORK_PROP, NETWORK_METHOD} = require('../../lib/constants/networkRequest');

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
		}), 'unknownError: "Chain description."');

		assert.equal(getErrorMessage({
			response: {
				...response,
				errors: 'Some errors',
			},
			toString,
			chainData,
		}), `unknownError: "Chain description."${EOL}errors: "Some errors"`);
	});

	it('Error message should return specific messages', () => {
		const toString = (data, nameOnly) => nameOnly ? 'Element name' : 'Chain description';
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
			[basePayload('failedStart'), 'Chain description.'],
			[basePayload('missingApp'), 'Application is not installed on the device.'],
			[basePayload('outdatedLibrary'), 'We have detected that your instrumentation library is outdated and the package cannot be opened. Update required.'],
			[basePayload('initPlatformFailed'), 'Failed to start Suitest bootstrap application on this device.'],
			[basePayload('packageNotFound'), 'There is nothing to test, because the selected configuration does not contain an app package. Upload a package on your app\'s configuration page before continuing.'],
			[basePayload('missingPackage'), 'There is nothing to test, because the selected configuration does not contain an app package. Upload a package on your app\'s configuration page before continuing.'],
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
				set(lensPath(['chainData']), {
					isClick: true,
				}, basePayload('invalidInput', 'elementNotSupported')),
				'Chain description. .click() is unsupported by this element.',
			],
			[
				set(lensPath(['chainData']), {
					setText: true,
				}, basePayload('invalidInput', 'elementNotSupported')),
				'Chain description. .setText() is unsupported by this element.',
			],
			[basePayload('ActionNotAvailable'), 'This test command is not supported by the current app configuration. Chain description.'],
			[
				set(lensPath(['chainData']), {
					type: 'press',
					repeat: 4,
				}, basePayload('conditionNotSatisfied')),
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
			[
				set(lensPath(['response', 'message', 'info', 'reason']), 'manualActionRequired', basePayload('aborted')),
				'Manual actions are not supported.',
			],
			[
				set(lensPath(['chainData']), {
					type: 'press',
					repeat: 4,
				}, basePayload('queryFailed')),
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
					chainData: {
						type: 'networkRequest',
						comparator: {val: 'test'},
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
					chainData: {
						type: 'networkRequest',
						request: {
							props: [{
								name: 'testHeader',
								val: 'testExpectedVal',
							}, {
								name: NETWORK_PROP.METHOD,
								val: NETWORK_METHOD.GET,
							}],
						},
						response: {
							props: [{
								name: NETWORK_PROP.BODY,
								val: 'testBody',
							}, {
								name: NETWORK_PROP.STATUS,
								val: 200,
							}],
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
				set(lensPath(['chainData']), {
					type: 'press',
					repeat: 4,
				}, basePayload('appRunning')),
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
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('notExpectedResponse')),
				'Unexpected response received while polling some-url. Chain description.',
			],
			[
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('noConnection')),
				'Could not connect to server while polling some-url. Chain description.',
			],
			[
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('invalidResult')),
				'Unexpected response received while polling some-url. Chain description.',
			],
			[
				set(lensPath(['chainData', 'url']), 'some-url', basePayload('invalidResult', 'resultTooLong')),
				'Response exceeded the size limit of 4KB while polling some-url. Chain description.',
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
			[basePayload('signInRequired'), 'Account needs to be signed in on target device.'],
			[basePayload('appleError65'), 'Failed to launch app: Apple ID account error - see https://suite.st/docs/devices/apple-tv/#apple-id-account-error.'],
			[basePayload('appleError70'), 'Failed to launch app: Xcode error - see https://suite.st/docs/devices/apple-tv/#xcode-error.'],
			[basePayload('appleEconnresetError'), 'Failed to launch app: Connection (ECONNRESET) error - see https://suite.st/docs/devices/apple-tv/#connection-econnreset-error.'],
			[basePayload('applePairingError'), 'Failed to launch app: Pairing error - see https://suite.st/docs/devices/apple-tv/#pairing-error.'],
			[basePayload('appleIosDeployError'), 'Failed to launch app: iOS Deploy not found error - see https://suite.st//docs/devices/apple-tv/#ios-deploy-not-found.'],
			[basePayload('appleAppSignError'), 'Failed to launch app: App code sign error - see https://suite.st/docs/devices/apple-tv/#app-code-sign-error.'],
		].forEach(([payload, expectMessage]) => {
			assert.equal(stripAnsiChars(getErrorMessage(payload)), expectMessage, JSON.stringify(payload, null, 4));
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

	it('test notStartedReasons keys', () => {
		const reasonsCodes = [
			'blasterError', 'bootstrappedPlatformError', 'testQueued', 'noAvailableAutomatedMinutes',
			'noActivePlan', 'candyBoxOffline', 'suitestDriveOffline', 'runningBootSequence',
			'deviceInUse', 'deviceDisabled', 'deviceDeleted', 'internalError',
			'notDefinedPlatform', 'lgWebosPlatformError', 'xboxPlatformError', 'androidPlatformError',
		].sort();

		assert.deepStrictEqual(Object.keys(notStartedReasons).sort(), reasonsCodes);
	});

	it('test getNotStartedReasonMessage', () => {
		assert.strictEqual(
			getNotStartedReasonMessage('blasterError'),
			'Cannot continue: IR blaster missing or incorrectly attached.\nInfrared blaster assigned to the device is missing or malfunctioning. Check the wiring, replace the blaster or assign another working CandyBox port to this device.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('bootstrappedPlatformError'),
			'Cannot continue: Suitest bootstrap app is not running.\nSuitest tried to start the bootstrap application on this device but failed several times and will try no more. Please connect to the device and start the bootstrap app manually, then disconnect and the scheduled test will continue. If you have configured the Suitest channel, tune the TV to this channel and verify that Suitest badge is displayed on TV in the top right corner. If you have not configured the Suitest channel, please contact support.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('testQueued'),
			'Execution will start as soon as other tests queued on this device will finish execution.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('noAvailableAutomatedMinutes'),
			'Cannot continue: you\'ve used up all of your testing minutes.\nYou testing a lot! How about getting a bigger subscription https://the.suite.st/preferences/billing? Or, if you would like to purchase more testing minutes for the current billing cycle, please contact sales@suite.st. Your testing minutes will renew.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('noActivePlan'),
			'Cannot continue: Your subscription has expired.\nYour subscription has expired, to continue using Suitest please renew your subscription (https://the.suite.st/preferences/billing).'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('candyBoxOffline'),
			'Cannot continue: CandyBox controlling this device is offline.\nCheck that the cable plugged into the CandyBox delivers Internet connection or reboot the CandyBox and allow about 5 minutes for it to initialize.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('suitestDriveOffline'),
			'Cannot continue: SuitestDrive controlling this device is offline.\nSuitestDrive controlling this device is not currently running or is offline. Please verify that the host computer has Internet connection and that SuitestDrive is running.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('runningBootSequence'),
			'Trying to open Suitest bootstrap application.\nTest will start after the Suitest bootstrap application will open. Suitest will attempt to open the app in a number of ways. After each attempt it will wait for 60 seconds for the app to respond. If it will not, Suitest will try the next available method. Current methods are: 1) Sending EXIT key to the device, 2) Executing user defined boot sequence, 3) turning the TV on and off 4) Turning the TV on again. If starting the test takes a long time, you should configure a better boot sequence.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('deviceInUse'),
			'A user is currently connected to this device. Execution will continue after the user disconnects.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('deviceDisabled'),
			'This device is disabled. For the execution to continue please enable the device.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('deviceDeleted'),
			'Cannot continue: Device is deleted.\nThe device on which the execution was scheduled has been deleted. Please cancel the test and schedule it on another available device.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('internalError'),
			'Cannot continue: Internal error occurred.\nWe are very sorry, but some fishy error occurred when Suitest was trying to execute your test. Our developers have been notified and are already working hard to resolve the problem.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('notDefinedPlatform'),
			'Cannot continue: Device does not support this platform.\nYou have scheduled the test execution with a configuration that depends on a platform, which this device does not currently support. You should either configure the platform on the device or cancel the test run.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('lgWebosPlatformError'),
			'Cannot continue: LG WebOS driver failed.\nLG WebOS driver has misbehaved. Please verify that the device is online and it\'s current IP address is correctly specified in Suitest. Then doublecheck if the Development mode is enabled on the device. If nothing helps try rebooting the device and/or the CandyBox.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('xboxPlatformError'),
			'Cannot continue: Xbox driver failed.\nXbox driver has misbehaved. Please verify that the device is online and it\'s current IP address and developer credentials are correctly specified in Suitest. If nothing helps try rebooting the device and restarting SuitestDrive.'
		);
		assert.strictEqual(
			getNotStartedReasonMessage('androidPlatformError'),
			'Cannot continue: Android driver failed.\nAndroid driver has misbehaved. Please verify that the device is online and it\'s current IP address is correctly specified in Suitest. If nothing helps try rebooting the device and restarting SuitestDrive.'
		);
	});
});
