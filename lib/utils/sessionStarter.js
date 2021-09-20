const sessionConstants = require('../constants/session');
const {TOKEN} = require('../constants/modes');
const chainPromise = require('./chainPromise');
const {validate, validators} = require('../validation');
const {captureException} = require('./sentry/Raven');
const envVars = require('../constants/enviroment');
const messageId = require('../constants/ipcMessageId');
const ipcClient = require('../testLauncher/ipc/client');
const {replWarnInteractive} = require('../texts');

// Unchained commands
const {openSessionUnchained: openSession} = require('../commands/openSession');
const {pairDeviceUnchained: pairDevice} = require('../commands/pairDevice');
const {setAppConfigUnchained: setAppConfig} = require('../commands/setAppConfig');
const R = require('ramda');

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
 * Start suitest session based on config
 * @param {Object} suitest instance
 * @param {string} deviceId
 * @param {string} configId
 * @param {string} [presetName]
 * @param {Object} suitestCtx
 */
const bootstrapSession = async(suitest, {deviceId, configId, presetName}, suitestCtx) => {
	try {
		if (suitestCtx.sessionType === TOKEN) {
			validate(validators.SESSION_BOOTSTRAP_TOKEN, suitestCtx, 'suitest token configuration');
			await openSession(
				suitest,
				{
					tokenId: suitestCtx.tokenId,
					tokenPassword: suitestCtx.tokenPassword,
				},
			);

			const configIdOrOverride = R.path([presetName, 'config'], suitestCtx.presets);
			const configOverride = R.is(Object, configIdOrOverride)
				? R.omit(['configId'], configIdOrOverride)
				: {};

			await setAppConfig(suitest, configId, configOverride);
			await pairDevice(suitest, deviceId, configId);

			suitest.interactive = () => {
				suitest.logger.warn(replWarnInteractive());

				return Promise.resolve();
			};

			// TODO: should be working for single device.
			/*
			if (suitestCtx.isDebugMode) {
				await suitest.webSockets.send({type: wsContentTypes.enableDebugMode});
			}
			// add interactive command only to child process instance and if running single device
			suitest.interactive = require('../../lib/commands/interactive');
			*/
		}
	} catch (error) {
		await captureException(error);
		// copy of handleLauncherError not imported to avoid cycle dependencies
		if (error.exit) {
			error.exit(1, suitest.logger);
		} else {
			suitest.logger.error(error);
			process.exit(1);
		}
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
		const [deviceId, configId, ipcPort] = process.env[envVars.SUITEST_CHILD_PROCESS].split('|');

		const suitestCtx = await connectToMasterIpc(ipcPort);

		suitest.configuration.extend(suitestCtx);

		await bootstrapSession(
			suitest,
			{
				deviceId,
				configId,
				presetName: process.env[envVars.SUITEST_PRESET_NAME],
			},
			suitestCtx,
		);
	}
};

module.exports = {
	bootstrapSession,
	connectToIpcAndBootstrapSession: chainPromise(connectToIpcAndBootstrapSession),
};
