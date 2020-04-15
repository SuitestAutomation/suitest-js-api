const {connectToIpcAndBootstrapSession} = require('./lib/utils/sessionStarter');
const Suitest = require('./suitest');
const suitest = new Suitest({exitOnError: true});

// Check if we are in launcher child process, connect to master IPC,
// override config, start session, pair device, set app config
connectToIpcAndBootstrapSession(suitest);

// Export public API
module.exports = suitest;
