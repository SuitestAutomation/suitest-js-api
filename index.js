// Network
const webSockets = require('./lib/api/webSockets');

// Contexts
const {authContext, appContext, pairedDeviceContext, testContext} = require('./lib/context');
const {unusedExpressionWatchers} = require('./lib/utils/unusedExpressionWatchers');

const {connectToIpcAndBootstrapSession} = require('./lib/utils/sessionStarter');
const SUITEST_API = require('./suitest');
const suitest = new SUITEST_API(
	true, {authContext, appContext, pairedDeviceContext, testContext, webSockets, unusedExpressionWatchers}
);

// Check if we are in launcher child process, connect to master IPC,
// override config, start session, pair device, set app config
connectToIpcAndBootstrapSession(suitest);
console.log('index js');

// Export public API
module.exports = suitest;
