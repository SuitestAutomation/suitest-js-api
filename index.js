// instance dependencies
const {authContext, appContext, pairedDeviceContext, testContext} = require('./lib/context');

const {connectToIpcAndBootstrapSession} = require('./lib/utils/sessionStarter');
const SUITEST_API = require('./suitest');
const suitest = new SUITEST_API(
	true, {authContext, appContext, pairedDeviceContext, testContext}
);

// Check if we are in launcher child process, connect to master IPC,
// override config, start session, pair device, set app config
connectToIpcAndBootstrapSession(suitest);

// Export public API
module.exports = suitest;
