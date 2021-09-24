const ENVIROMENT_VARS = Object.freeze({
	/**
	 * @description indicates that session is running as launcher child process, contains deviceId|configId|ipcPortNumber
	 */
	SUITEST_CHILD_PROCESS: 'SUITEST_CHILD_PROCESS',
	SUITEST_PRESET_NAME: 'SUITEST_PRESET_NAME',
	BE_SERVER: 'BE_SERVER',
});

module.exports = ENVIROMENT_VARS;
