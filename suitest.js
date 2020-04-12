require('./lib/utils/sentry/Raven');

// Commands
const {openSession} = require('./lib/commands/openSession');
const {closeSession} = require('./lib/commands/closeSession');
const {startTestPack} = require('./lib/commands/startTestPack');
const {pairDevice} = require('./lib/commands/pairDevice');
const releaseDevice = require('./lib/commands/releaseDevice');
const {setAppConfig} = require('./lib/commands/setAppConfig');
const startTest = require('./lib/commands/startTest');
const endTest = require('./lib/commands/endTest');
const configure = require('./lib/commands/configure');
const interactive = require('./lib/commands/interactive');

// Chains
const openAppFactory = require('./lib/chains/openAppChain');
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

// Network
const {webSocketsFactory} = require('./lib/api/webSockets');
const {unusedExpressionWatchersFactory} = require('./lib/utils/unusedExpressionWatchers');
const ipcClient = require('./lib/testLauncher/ipc/client');
const ipcServer = require('./lib/testLauncher/ipc/server');

// Contexts
const Context = require('./lib/utils/Context');
const AuthContext = require('./lib/utils/AuthContext');

const {warnLauncherAndLibHasDiffVersions} = require('./lib/utils/packageMetadataHelper');

// Publicly available API goes here
class SUITEST_API {
	constructor(exitOnError, instanceDependencies) {
		// default
		this.authContext = new AuthContext();
		this.appContext = new Context();
		this.pairedDeviceContext = new Context();
		this.testContext = new Context();
		this.webSockets = webSocketsFactory();
		this.unusedExpressionWatchers = unusedExpressionWatchersFactory();
		// override default by provided
		Object.assign(this, instanceDependencies);

		this.openSession = (...args) => openSession(this, ...args);
		this.pairDevice = (...args) => pairDevice(this, ...args);
		this.setAppConfig = (...args) => setAppConfig(this, ...args);
		this.closeSession = (...args) => closeSession(this, ...args);
		this.startTestPack = (...args) => startTestPack(this, ...args);
		this.startTest = (...args) => startTest(this, ...args);
		this.endTest = (...args) => endTest(this, ...args);
		this.releaseDevice = (...args) => releaseDevice(this, ...args);
		this.configure = configure; // TODO can we remove it as it is deprecated???
		this.interactive = interactive; // todo how it should work with multisession???

		this.openApp = openAppFactory(this).openApp;
		this.openUrl = openUrlFactory(this).openUrl;
		this.application = applicationFactory(this).application;
		this.clearAppData = clearAppDataFactory(this).clearAppData;
		this.location = locationFactory(this).location;
		this.cookie = cookieFactory(this).cookie;
		this.sleep = sleepFactory(this).sleep;
		this.press = pressButtonFactory(this).pressButton;
		this.position = positionFactory(this).position;
		this.window = windowFactory(this).window;
		this.executeCommand = executeCommandFactory(this).executeCommand;
		// this.executeBrightScript = executeBrightScriptFactory(this).executeBrightScript;
		this.jsExpression = jsExpressionFactory(this).jsExpression;
		// this.brightScriptExpression = brightScriptExpressionFactory(this).brightScriptExpression;
		this.element = elementFactory(this).element;
		this.networkRequest = networkRequestFactory(this).networkRequest;
		this.video = videoFactory(this).video;
		this.psVideo = playstationVideoFactory(this).playstationVideo;
		this.pollUrl = pollUrlFactory(this).pollUrl;

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

		this.assert = {
			application: applicationFactory(this).applicationAssert,
			clearAppData: clearAppDataFactory(this).clearAppDataAssert,
			openApp: openAppFactory(this).openAppAssert,
			openUrl: openUrlFactory(this).openUrlAssert,
			location: locationFactory(this).locationAssert,
			cookie: cookieFactory(this).cookieAssert,
			sleep: sleepFactory(this).sleepAssert,
			press: pressButtonFactory(this).pressButtonAssert,
			position: positionFactory(this).positionAssert,
			window: windowFactory(this).windowAssert,
			executeCommand: executeCommandFactory(this).executeCommandAssert,
			// executeBrightScript: executeBrightScriptFactory(this).executeBrightScriptAssert,
			jsExpression: jsExpressionFactory(this).jsExpressionAssert,
			// brightScriptExpression: brightScriptExpressionFactory(this).brightScriptExpressionAssert,
			element: elementFactory(this).elementAssert,
			pollUrl: pollUrlFactory(this).pollUrlAssert,
			runTest: runTestFactory(this).runTestAssert,
			networkRequest: networkRequestFactory(this).networkRequestAssert,
			video: videoFactory(this).videoAssert,
			psVideo: playstationVideoFactory(this).playstationVideoAssert,
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
			warnLauncherAndLibHasDiffVersions();
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
}

// Export public API
module.exports = SUITEST_API;
