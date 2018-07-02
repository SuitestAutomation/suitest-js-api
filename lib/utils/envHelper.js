const envVars = require('../constants/enviroment');
const sessionConstants = require('../constants/session');
const SuitestError = require('./SuitestError');
const chainPromise = require('./chainPromise');
const {validate, validators} = require('../validataion');
const {captureException} = require('./sentry/Raven');
const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');

// Unchained commands
const {openSessionUnchained: openSession} = require('../commands/openSession');
const {pairDeviceUnchained: pairDevice} = require('../commands/pairDevice');
const {setAppConfigUnchained: setAppConfig} = require('../commands/setAppConfig');

const handleUserEnvVar = async() => {
	const sessionType = process.env[envVars.SUITEST_SESSION_TYPE];

	try {
		// If no env vars provided, don't start boot sequence
		if (!Object.keys(envVars).some(key => process.env[envVars[key]]))
			return;

		// Throw error for invalid SUITEST_SESSION_TYPE
		if (sessionType !== 'automated' && sessionType !== 'interactive') {
			throw new SuitestError(
				`Invalid env variable provided. ${envVars.SUITEST_SESSION_TYPE} should be 'automated' or 'interactive'`,
				SuitestError.INVALID_INPUT,
			);
		}

		// Run automated session
		if (process.env[envVars.SUITEST_SESSION_TYPE] === 'automated') {
			validate(validators.ENV_VARS_AUTOMATED, process.env, 'suitest automated env variables');
			await openSession(
				{sessionToken: process.env[envVars.SUITEST_SESSION_TOKEN]},
				sessionConstants.AUTOMATED,
			);
			await pairDevice(process.env[envVars.SUITEST_DEVICE_ID]);

			return;
		}

		// Run interactive session
		validate(validators.ENV_VARS_INTERACTIVE, process.env, 'suitest intaractive env variables');
		await openSession(
			{sessionToken: process.env[envVars.SUITEST_SESSION_TOKEN]},
			sessionConstants.INTERACTIVE,
		);
		if (process.env[envVars.SUITEST_DEBUG_MODE] === 'yes') {
			await webSockets.send({type: wsContentTypes.enableDebugMode});
		}
		await pairDevice(process.env[envVars.SUITEST_DEVICE_ID]);
		await setAppConfig(process.env[envVars.SUITEST_APP_CONFIG_ID]);
	} catch (error) {
		await captureException(error);
		error.exit && error.exit(1);
	}
};

module.exports = {
	handleUserEnvVar: chainPromise(handleUserEnvVar),
};
