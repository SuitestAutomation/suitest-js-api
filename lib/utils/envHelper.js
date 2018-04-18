const envVars = require('../constants/enviroment');
const sessionConstants = require('../constants/session');
const SuitestError = require('./SuitestError');
const chainPromise = require('../utils/chainPromise');
const {validate, validators} = require('../validataion');
const webSockets = require('../api/webSockets');

// Unchained commands
const {openSessionUnchained: openSession} = require('../commands/openSession');
const {pairDeviceUnchained: pairDevice} = require('../commands/pairDevice');
const {setAppConfigUnchained: setAppConfig} = require('../commands/setAppConfig');

// Exit process with code 1 on uncaughtException or unhandledRejection
// Required for proper termination of test launcher child processes
const exit = err => {
	webSockets.disconnect();
	console.error(err);
	process.exit(1);
};

process.once('uncaughtException', exit);
process.once('unhandledRejection', exit);

const handleUserEnvVar = async() => {
	const sessionType = process.env[envVars.SUITEST_SESSION_TYPE];

	try {
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

		// Run interactive sessiont
		validate(validators.ENV_VARS_INTERACTIVE, process.env, 'suitest intaractive env variables');
		await openSession(
			{sessionToken: process.env[envVars.SUITEST_SESSION_TOKEN]},
			sessionConstants.INTERACTIVE,
		);
		await pairDevice(process.env[envVars.SUITEST_DEVICE_ID]);
		await setAppConfig(process.env[envVars.SUITEST_APP_CONFIG_ID]);
	} catch (error) {
		error.exit && error.exit(1);
	}
};

module.exports = {
	handleUserEnvVar: chainPromise(handleUserEnvVar),
	exit,
};
