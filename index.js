const {connectToIpcAndBootstrapSession} = require('./lib/utils/sessionStarter');
const SUITEST_API = require('./suitest');
const suitest = new SUITEST_API({exitOnError: true});

// Check if we are in launcher child process, connect to master IPC,
// override config, start session, pair device, set app config
connectToIpcAndBootstrapSession(suitest).catch(function(err) {
	suitest.logger.error(err);
	process.exit(1);
});

// Export public API
module.exports = suitest;
