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
const {openApp, openAppAssert} = require('./lib/chains/openAppChain');
const {openUrl, openUrlAssert} = require('./lib/chains/openUrlChain');
const {location, locationAssert} = require('./lib/chains/locationChain');
const {application, applicationAssert} = require('./lib/chains/applicationChain');
const {clearAppData, clearAppDataAssert} = require('./lib/chains/clearAppDataChain');
const {cookie, cookieAssert} = require('./lib/chains/cookieChain');
const {sleep, sleepAssert} = require('./lib/chains/sleepChain');
const {pressButton, pressButtonAssert} = require('./lib/chains/pressButtonChain');
const {position, positionAssert} = require('./lib/chains/positionChain');
const {window, windowAssert} = require('./lib/chains/windowChain');
const {executeCommand, executeCommandAssert} = require('./lib/chains/executeCommandChain');
// const {executeBrightScript, executeBrightScriptAssert} = require('./lib/chains/executeBrightScriptChain');
const {jsExpression, jsExpressionAssert} = require('./lib/chains/javascriptExpressionChain');
// const {brightScriptExpression, brightScriptExpressionAssert} = require('./lib/chains/brightScriptExpressionChain');
const {element, elementAssert} = require('./lib/chains/elementChain');
const {networkRequest, networkRequestAssert} = require('./lib/chains/networkRequestChain');
const {pollUrl, pollUrlAssert} = require('./lib/chains/pollUrlChain');
const {video, videoAssert} = require('./lib/chains/videoChain');

// Constants
const {ELEMENT_PROP, VALUE} = require('./lib/constants/element');
const {PROP_COMPARATOR} = require('./lib/constants/comparator');
const VIDEO_STATE = require('./lib/constants/videoState');
const CONTENT_MODE = require('./lib/constants/contentMode');
const ELEMENT_STATE = require('./lib/constants/elementState');
const TEXT_ALIGNMENT = require('./lib/constants/textAlignment');
const BORDER_STYLE = require('./lib/constants/borderStyle');
const VISIBILITY_STATE = require('./lib/constants/visibilityState');
const VRC = require('./lib/constants/vrc');
const KEY = require('./lib/constants/keys');
const {NETWORK_PROP, NETWORK_METHOD} = require('./lib/constants/networkRequest');

// For testing
const webSockets = require('./lib/api/webSockets');

// Contexts
const {authContext, appContext, pairedDeviceContext, testContext} = require('./lib/context');

// Env helper
const envHelper = require('./lib/utils/envHelper');
const {warnUnusedLeaves} = require('./lib/utils/unusedExpressionWatchers');

const {warnLauncherAndLibHasDiffVersions} = require('./lib/utils/packageMetadataHelper');

// Publicly available API goes here
class SUITEST_API {
	constructor() {
		this.openSession = openSession;
		this.closeSession = closeSession;
		this.startTestPack = startTestPack;
		this.startTest = startTest;
		this.endTest = endTest;
		this.pairDevice = pairDevice;
		this.releaseDevice = releaseDevice;
		this.setAppConfig = setAppConfig;
		this.configure = configure;
		this.interactive = interactive;

		this.openApp = openApp;
		this.openUrl = openUrl;
		this.application = application;
		this.clearAppData = clearAppData;
		this.cookie = cookie;
		this.location = location;
		this.sleep = sleep;
		this.press = pressButton;
		this.position = position;
		this.window = window;
		this.executeCommand = executeCommand;
		// this.executeBrightScript = executeBrightScript;
		this.jsExpression = jsExpression;
		// this.brightScriptExpression = brightScriptExpression;
		this.element = element;
		this.video = video;
		this.networkRequest = networkRequest;
		this.pollUrl = pollUrl;

		this.PROP = ELEMENT_PROP;
		this.COMP = PROP_COMPARATOR;
		this.VALUE = VALUE;
		this.VIDEO_STATE = VIDEO_STATE;
		this.VISIBILITY_STATE = VISIBILITY_STATE;
		this.CONTENT_MODE = CONTENT_MODE;
		this.ELEMENT_STATE = ELEMENT_STATE;
		this.TEXT_ALIGNMENT = TEXT_ALIGNMENT;
		this.BORDER_STYLE = BORDER_STYLE;
		this.VRC = VRC;
		this.KEY = KEY;
		this.NETWORK_PROP = NETWORK_PROP;
		this.NETWORK_METHOD = NETWORK_METHOD;

		this.authContext = authContext;
		this.appContext = appContext;
		this.pairedDeviceContext = pairedDeviceContext;
		this.testContext = testContext;

		// For testing
		this.webSockets = webSockets;

		this.assert = {
			application: applicationAssert,
			clearAppData: clearAppDataAssert,
			openApp: openAppAssert,
			openUrl: openUrlAssert,
			location: locationAssert,
			sleep: sleepAssert,
			press: pressButtonAssert,
			position: positionAssert,
			window: windowAssert,
			executeCommand: executeCommandAssert,
			// executeBrightScript: executeBrightScriptAssert,
			jsExpression: jsExpressionAssert,
			// brightScriptExpression: brightScriptExpressionAssert,
			cookie: cookieAssert,
			element: elementAssert,
			pollUrl: pollUrlAssert,
			networkRequest: networkRequestAssert,
			video: videoAssert,
		};
	}
}

// Start session, pair device, set app config based on env vars
envHelper.handleUserEnvVar();

// Export public API
module.exports = new SUITEST_API();

// Listen to process events to trigger websocket termination and dump warnings, if any
const shutDown = () => {
	// Make sure socket connection is done
	webSockets.disconnect();

	// Warn user about un-awaited chains
	warnUnusedLeaves();

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
	webSockets.disconnect();
	process.exit(1);
};

process.on('uncaughtException', exit);
process.on('unhandledRejection', exit);
