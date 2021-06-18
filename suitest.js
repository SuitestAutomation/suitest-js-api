require('./lib/utils/sentry/Raven');
const util = require('util');
const texts = require('./lib/texts');

// Commands
const {openSession} = require('./lib/commands/openSession');
const {closeSession} = require('./lib/commands/closeSession');
const {startTestPack} = require('./lib/commands/startTestPack');
const {pairDevice} = require('./lib/commands/pairDevice');
const releaseDevice = require('./lib/commands/releaseDevice');
const {setAppConfig} = require('./lib/commands/setAppConfig');
const startTest = require('./lib/commands/startTest');
const endTest = require('./lib/commands/endTest');

// Chains
const openAppFactory = require('./lib/chains/openAppChain');
const takeScreenshotFactory = require('./lib/chains/takeScreenshotChain');
const saveScreenshotFactory = require('./lib/chains/saveScreenshotChain');
const openUrlFactory = require('./lib/chains/openUrlChain');
const locationFactory = require('./lib/chains/locationChain');
const applicationFactory = require('./lib/chains/applicationChain');
const clearAppDataFactory = require('./lib/chains/clearAppDataChain');
const cookieFactory = require('./lib/chains/cookieChain');
const sleepFactory = require('./lib/chains/sleepChain');
const pressButtonFactory = require('./lib/chains/pressButtonChain');
const positionFactory = require('./lib/chains/positionChain');
const windowFactory = require('./lib/chains/windowChain');
const executeCommandFactory = require('./lib/chains/executeCommandChain');
const runTestFactory = require('./lib/chains/runTestChain');
// const executeBrightScriptFactory = require('./lib/chains/executeBrightScriptChain');
const jsExpressionFactory = require('./lib/chains/javascriptExpressionChain');
// const brightScriptExpressionFactory = require('./lib/chains/brightScriptExpressionChain');
const elementFactory = require('./lib/chains/elementChain');
const pollUrlFactory = require('./lib/chains/pollUrlChain');
const networkRequestFactory = require('./lib/chains/networkRequestChain');
const videoFactory = require('./lib/chains/videoChain');
const playstationVideoFactory = require('./lib/chains/playstationVideoChain');
const setScreenOrientationFactory = require('./lib/chains/setScreenOrientationChain');

// Constants
const {ELEMENT_PROP, VALUE} = require('./lib/constants/element');
const {PROP_COMPARATOR} = require('./lib/constants/comparator');
const VIDEO_STATE = require('./lib/constants/videoState');
const CONTENT_MODE = require('./lib/constants/contentMode');
const ELEMENT_STATE = require('./lib/constants/elementState');
const TEXT_ALIGNMENT = require('./lib/constants/textAlignment');
const IMAGE_LOAD_STATE = require('./lib/constants/imageLoadState');
const BORDER_STYLE = require('./lib/constants/borderStyle');
const VISIBILITY_STATE = require('./lib/constants/visibilityState');
const VRC = require('./lib/constants/vrc');
const KEY = require('./lib/constants/keys');
const {NETWORK_PROP, NETWORK_METHOD} = require('./lib/constants/networkRequest');
const HAD_NO_ERROR = require('./lib/constants/hadNoError');
const TAP_TYPES = require('./lib/constants/tapTypes');
const LAUNCH_MODE = require('./lib/constants/launchMode');
const DIRECTIONS = require('./lib/constants/directions');
const SCREEN_ORIENTATION = require('./lib/constants/screenOrientation');

// Network
const webSocketsFactory = require('./lib/api/webSockets');
const unusedExpressionWatchersFactory = require('./lib/utils/unusedExpressionWatchers');
const ipcClient = require('./lib/testLauncher/ipc/client');
const ipcServer = require('./lib/testLauncher/ipc/server');

// Contexts
const Context = require('./lib/utils/Context');
const AuthContext = require('./lib/utils/AuthContext');
const {configFactory} = require('./config');
const {setUpRaven} = require('./lib/utils/sentry/Raven');
const {warnLauncherAndLibHasDiffVersions} = require('./lib/utils/packageMetadataHelper');
const {createLogger} = require('./lib/utils/logger');

const EventEmitter = require('events');

// Publicly available API goes here
class SUITEST_API extends EventEmitter {
	constructor({exitOnError} = {}) {
		super();

		// instance dependencies
		this.authContext = new AuthContext();
		this.appContext = new Context();
		this.pairedDeviceContext = new Context();
		this.getPairedDevice = () => this.pairedDeviceContext.context;
		this.testContext = new Context();
		this.configuration = configFactory();
		this.config = this.configuration.config;
		this.configure = util.deprecate(this.configuration.override, texts.warnConfigureDeprecation());
		this.configuration.configurableFields.map(fieldName => {
			this[`set${fieldName[0].toUpperCase()}${fieldName.slice(1)}`] = (val) => this.configuration.override({[fieldName]: val});
		});

		// creating methods based on instance dependencies
		this.logger = createLogger(this.configuration.config, this.pairedDeviceContext);
		this.unusedExpressionWatchers = unusedExpressionWatchersFactory(this);
		this.webSockets = webSocketsFactory(this);
		setUpRaven(this.configuration.config, this.authContext);

		this.openSession = (...args) => openSession(this, ...args);
		this.pairDevice = (...args) => pairDevice(this, ...args);
		this.setAppConfig = (...args) => setAppConfig(this, ...args);
		this.closeSession = (...args) => closeSession(this, ...args);
		this.startTestPack = (...args) => startTestPack(this, ...args);
		this.startTest = (...args) => startTest(this, ...args);
		this.endTest = (...args) => endTest(this, ...args);
		this.releaseDevice = (...args) => releaseDevice(this, ...args);

		const {openApp, openAppAssert} = openAppFactory(this);
		const {openUrl, openUrlAssert} = openUrlFactory(this);
		const {application, applicationAssert} = applicationFactory(this);
		const {clearAppData, clearAppDataAssert} = clearAppDataFactory(this);
		const {location, locationAssert} = locationFactory(this);
		const {cookie, cookieAssert} = cookieFactory(this);
		const {sleep, sleepAssert} = sleepFactory(this);
		const {pressButton, pressButtonAssert} = pressButtonFactory(this);
		const {position, positionAssert} = positionFactory(this);
		const {window, windowAssert} = windowFactory(this);
		const {executeCommand, executeCommandAssert} = executeCommandFactory(this);
		const {jsExpression, jsExpressionAssert} = jsExpressionFactory(this);
		const {networkRequest, networkRequestAssert} = networkRequestFactory(this);
		const {video, videoAssert} = videoFactory(this);
		const {element, elementAssert} = elementFactory(this, video);
		const {playstationVideo, playstationVideoAssert} = playstationVideoFactory(this);
		const {pollUrl, pollUrlAssert} = pollUrlFactory(this);
		const {runTestAssert} = runTestFactory(this);
		const {takeScreenshot} = takeScreenshotFactory(this);
		const {saveScreenshot} = saveScreenshotFactory(this);
		const {setScreenOrientation, setScreenOrientationAssert} = setScreenOrientationFactory(this);

		this.openApp = openApp;
		this.openUrl = openUrl;
		this.application = application;
		this.clearAppData = clearAppData;
		this.location = location;
		this.cookie = cookie;
		this.sleep = sleep;
		this.press = pressButton;
		this.position = position;
		this.window = window;
		this.executeCommand = executeCommand;
		// this.executeBrightScript = executeBrightScriptFactory(this).executeBrightScript;
		this.jsExpression = jsExpression;
		// this.brightScriptExpression = brightScriptExpressionFactory(this).brightScriptExpression;
		this.networkRequest = networkRequest;
		this.element = element;
		this.video = video;
		this.psVideo = playstationVideo;
		this.pollUrl = pollUrl;
		this.takeScreenshot = takeScreenshot;
		this.saveScreenshot = saveScreenshot;
		this.setScreenOrientation = setScreenOrientation;

		this.PROP = ELEMENT_PROP;
		this.COMP = PROP_COMPARATOR;
		this.VALUE = VALUE;
		this.VIDEO_STATE = VIDEO_STATE;
		this.VISIBILITY_STATE = VISIBILITY_STATE;
		this.CONTENT_MODE = CONTENT_MODE;
		this.ELEMENT_STATE = ELEMENT_STATE;
		this.TEXT_ALIGNMENT = TEXT_ALIGNMENT;
		this.IMAGE_LOAD_STATE = IMAGE_LOAD_STATE;
		this.BORDER_STYLE = BORDER_STYLE;
		this.VRC = VRC;
		this.KEY = KEY;
		this.NETWORK_PROP = NETWORK_PROP;
		this.NETWORK_METHOD = NETWORK_METHOD;
		this.HAD_NO_ERROR = HAD_NO_ERROR;
		this.TAP_TYPES = TAP_TYPES;
		this.LAUNCH_MODE = LAUNCH_MODE;
		this.DIRECTIONS = DIRECTIONS;
		this.SCREEN_ORIENTATION = SCREEN_ORIENTATION;

		this.assert = {
			application: applicationAssert,
			clearAppData: clearAppDataAssert,
			openApp: openAppAssert,
			openUrl: openUrlAssert,
			location: locationAssert,
			cookie: cookieAssert,
			sleep: sleepAssert,
			press: pressButtonAssert,
			position: positionAssert,
			window: windowAssert,
			executeCommand: executeCommandAssert,
			// executeBrightScript: executeBrightScriptFactory(this).executeBrightScriptAssert,
			jsExpression: jsExpressionAssert,
			// brightScriptExpression: brightScriptExpressionFactory(this).brightScriptExpressionAssert,
			element: elementAssert,
			pollUrl: pollUrlAssert,
			runTest: runTestAssert,
			networkRequest: networkRequestAssert,
			video: videoAssert,
			psVideo: playstationVideoAssert,
			setScreenOrientation: setScreenOrientationAssert,
		};

		// Listen to process events to trigger websocket termination and dump warnings, if any
		const shutDown = () => {
			// Make sure socket connection is done
			this.webSockets.disconnect();

			// Make sure ipc connection is done
			ipcClient.disconnect();
			ipcServer.close();

			// Warn user about un-awaited chains
			this.unusedExpressionWatchers.warnUnusedLeaves();

			// warn about that launcher and library have different versions
			warnLauncherAndLibHasDiffVersions(this.logger, this.config);
			// Do not force process exit, because this will interfere with other libs (e.g. Mocha)
			// that user might be using. Instead make sure there are no event listeners left on our side
			// to keep process running
		};

		[
			// When event loop ends or process.exit() called
			'exit',

			// Ctrl+C in terminal
			'SIGINT',
			'SIGQUIT',

			// Ctrl+/ in terminal
			'SIGTERM',

			// Console is closed on Windows
			'SIGHUP',

			// Ctrl+Break on Windows
			'SIGBREAK',
		].forEach(term => process.on(term, shutDown));

		// Exit process with code 1 on uncaughtException or unhandledRejection
		// Required for proper termination of test launcher child processes
		const exit = err => {
			console.error(err);
			this.webSockets.disconnect();
			ipcClient.disconnect();
			ipcServer.close();
			process.exit(1);
		};

		if (exitOnError) {
			process.on('uncaughtException', exit);
			process.on('unhandledRejection', exit);
		}
	}

	getConfig() {
		return {...this.configuration.config};
	}
}

// Export public API
module.exports = SUITEST_API;
