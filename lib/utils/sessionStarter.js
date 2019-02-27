const net = require('net');
const {handleLauncherError} = require('./testLauncherHelper');
const sessionConstants = require('../constants/session');
const {AUTOMATED} = require('../constants/modes');
const chainPromise = require('./chainPromise');
const {validate, validators} = require('../validataion');
const {captureException} = require('./sentry/Raven');
const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const envVars = require('../constants/enviroment');
const messageId = require('../constants/ipcMessageId');
const {readMessage} = require('./ipcHelper');
const {extend} = require('../../config');

// Unchained commands
const {openSessionUnchained: openSession} = require('../commands/openSession');
const {pairDeviceUnchained: pairDevice} = require('../commands/pairDevice');
const {setAppConfigUnchained: setAppConfig} = require('../commands/setAppConfig');

/**
 * Connect child process to master IPC server
 * @param {number} port - port number
 * @returns {Promise<Object>} - config object
 */
/* istanbul ignore next */
const connectToMasterIpc = (port) => {
	const ipcSocket = net.connect(port, 'localhost');

	ipcSocket.on('error', () => ipcSocket.unref());

	// Wait for 'SETUP' message from master with config object
	return new Promise(resolve => {
		ipcSocket.on('data', chunk => {
			const msg = readMessage(chunk);

			if (msg.id === messageId.SETUP) {
				ipcSocket.unref();
				resolve(msg.data.config);
			}
		});
	});
};

/**
 * Start automated or interactive session based on config
 * @param {string} deviceId
 * @param {Object} config
 */
const bootstrapSession = async(deviceId, config) => {
	try {
		// Run automated session
		if (config.sessionType === AUTOMATED) {
			validate(validators.SESSION_BOOTSTRAP_AUTOMATED, config, 'suitest automated config');
			await openSession(
				{sessionToken: config.sessionToken},
				sessionConstants.AUTOMATED,
			);
			await pairDevice(deviceId);

			return;
		}

		// Run interactive session
		validate(validators.SESSION_BOOTSTRAP_INTERACTIVE, config, 'suitest intaractive config');
		await openSession(
			{sessionToken: config.sessionToken},
			sessionConstants.INTERACTIVE,
		);
		if (config.isDebugMode) {
			await webSockets.send({type: wsContentTypes.enableDebugMode});
		}
		await pairDevice(deviceId);
		await setAppConfig(config.appConfigId);
	} catch (error) {
		await captureException(error);
		handleLauncherError(error);
	}
};

/**
 * Check if SUITEST_LAUNCHER_PROCESS env var present,
 * it contains deviceId and master process ipc port number,
 * connect to master, get config, override current config and bootstrap session
 */
/* istanbul ignore next */
const connectToIpcAndBootstrapSession = async() => {
	if (process.env[envVars.SUITEST_LAUNCHER_PROCESS]) {
		const [deviceId, ipcPort] = process.env[envVars.SUITEST_LAUNCHER_PROCESS].split('|');
		const config = await connectToMasterIpc(ipcPort);

		extend(config);

		await bootstrapSession(deviceId, config);
	}
};

module.exports = {
	bootstrapSession,
	connectToIpcAndBootstrapSession: chainPromise(connectToIpcAndBootstrapSession),
};
