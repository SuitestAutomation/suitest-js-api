const {handleLauncherError} = require('./testLauncherHelper');
const sessionConstants = require('../constants/session');
const {AUTOMATED} = require('../constants/modes');
const chainPromise = require('./chainPromise');
const {validate, validators} = require('../validataion');
const {captureException} = require('./sentry/Raven');
const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');

// Unchained commands
const {openSessionUnchained: openSession} = require('../commands/openSession');
const {pairDeviceUnchained: pairDevice} = require('../commands/pairDevice');
const {setAppConfigUnchained: setAppConfig} = require('../commands/setAppConfig');

/**
 * Start automated or interactive session based on config
 * @param {'automated'|'interactive'} config.sessionType
 * @param {string} config.sessionToken
 * @param {string} config.deviceId
 * @param {string} config.appConfigId
 * @param {boolean} config.isDebugMode
 */
const bootstrapSession = async(config) => {
	try {
		// Run automated session
		if (config.sessionType === AUTOMATED) {
			validate(validators.SESSION_BOOTSTRAP_AUTOMATED, config, 'suitest automated config');
			await openSession(
				{sessionToken: config.sessionToken},
				sessionConstants.AUTOMATED,
			);
			await pairDevice(config.deviceId);

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
		await pairDevice(config.deviceId);
		await setAppConfig(config.appConfigId);
	} catch (error) {
		await captureException(error);
		handleLauncherError(error);
	}
};

module.exports = {
	bootstrapSession: chainPromise(bootstrapSession),
};
