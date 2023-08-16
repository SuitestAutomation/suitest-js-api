const ENVIRONMENT_VARS = Object.freeze({
	/**
	 * @description indicates that session is running as launcher child process, contains deviceId|configId|ipcPortNumber
	 */
	SUITEST_CHILD_PROCESS: 'SUITEST_CHILD_PROCESS',
	SUITEST_DEVICE_ID: 'SUITEST_DEVICE_ID',
	SUITEST_PRESET_NAME: 'SUITEST_PRESET_NAME',
	SUITEST_BE_SERVER: 'SUITEST_BE_SERVER',
});

module.exports = ENVIRONMENT_VARS;
