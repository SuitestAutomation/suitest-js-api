const {handleLauncherError} = require('./testLauncherHelper');
const sessionConstants = require('../constants/session');
const {AUTOMATED} = require('../constants/modes');
const chainPromise = require('./chainPromise');
const {validate, validators} = require('../validation');
const {captureException} = require('./sentry/Raven');
const wsContentTypes = require('../api/wsContentTypes');
const envVars = require('../constants/enviroment');
const messageId = require('../constants/ipcMessageId');
const ipcClient = require('../testLauncher/ipc/client');

// Unchained commands
const {openSessionUnchained: openSession} = require('../commands/openSession');
const {pairDeviceUnchained: pairDevice} = require('../commands/pairDevice');
const {setAppConfigUnchained: setAppConfig} = require('../commands/setAppConfig');

/**
 * Connect child process to launcher IPC server
 * @param {number} port - port number
 * @returns {Promise<Object>} - config object
 */
/* istanbul ignore next */
const connectToMasterIpc = (port) => {
	ipcClient.connect(port);

	// Wait for 'SETUP_SESSION' message from master with config object, then resolve
	return new Promise(resolve => {
		ipcClient.addListener(messageId.SETUP_SESSION, data => {
			resolve(data.config);
		});
	});
};

/**
 * Start automated or interactive session based on config
 * @param {Object} suitest instance
 * @param {string} deviceId
 * @param {Object} config
 */
const bootstrapSession = async(suitest, deviceId, config) => {
	try {
		// Run automated session
		if (config.sessionType === AUTOMATED) {
			validate(validators.SESSION_BOOTSTRAP_AUTOMATED, config, 'suitest automated config');
			await openSession(
				suitest,
				{sessionToken: config.sessionToken},
				sessionConstants.AUTOMATED,
			);
			await pairDevice(suitest, deviceId);

			return;
		}

		// Run interactive session
		validate(validators.SESSION_BOOTSTRAP_INTERACTIVE, config, 'suitest intaractive config');
		await openSession(
			suitest,
			{sessionToken: config.sessionToken},
			sessionConstants.INTERACTIVE,
		);
		if (config.isDebugMode) {
			await suitest.webSockets.send({type: wsContentTypes.enableDebugMode});
		}
		await pairDevice(suitest, deviceId);
		await setAppConfig(suitest, config.appConfigId);
	} catch (error) {
		await captureException(error);
		handleLauncherError(error);
	}
};

/**
 * Check if SUITEST_CHILD_PROCESS env var present,
 * it contains deviceId and master process ipc port number,
 * connect to master, get config, override current config and bootstrap session
 */
/* istanbul ignore next */
const connectToIpcAndBootstrapSession = async(suitest) => {
	if (process.env[envVars.SUITEST_CHILD_PROCESS]) {
		const [deviceId, ipcPort] = process.env[envVars.SUITEST_CHILD_PROCESS].split('|');
		const config = await connectToMasterIpc(ipcPort);

		suitest.configuration.extend(config);

		await bootstrapSession(suitest, deviceId, config);
	}
};

module.exports = {
	bootstrapSession,
	connectToIpcAndBootstrapSession: chainPromise(connectToIpcAndBootstrapSession),
};
