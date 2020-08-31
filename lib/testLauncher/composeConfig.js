const {promptPassword} = require('../utils/testLauncherHelper');
const {pickNonNil} = require('../utils/common');
const {hideOwnArgs} = require('./processArgs');
const suitest = require('../../index');
const fs = require('fs');
const rc = require('rc');
const SuitestError = require('../utils/SuitestError');
const {invalidUserConfig} = require('../texts');

/**
 * Read `.suitestrc` launcher config file.
 * If file not found, return empty object.
 * Supports json and ini formats.
 * cli arguments are not parsed.
 * If file found, but json invalid, throw error.
 * @returns {Object}
 */
function readRcConfig() {
	// ignore .suitestrc files when running unit tests
	if (global._suitestTesting)
		return {};

	return rc('suitest', {}, () => ({}));
}

/**
 * Read josn config file provided by user.
 * @param {string} path - path to config file
 * @throws {SuitestError}
 * @returns {Object} - parsed json
 */
function readUserConfig(path) {
	try {
		return JSON.parse(fs.readFileSync(path));
	} catch (error) {
		throw new SuitestError(invalidUserConfig(path, error.message), error.code);
	}
}

/**
 * Compose config from rc file, user config file and cli args
 * @param {Object} argv - yargs cli args object
 * @param {boolean} askPassword - ask for password or not
 * @returns {{ownArgs: Object, userCommandArgs: string[]}}
 */
const composeConfig = async(argv, askPassword) => {
	const rcConfig = readRcConfig();
	const configFilePath = argv.configFile || rcConfig.configFile;
	const userConfig = configFilePath ? readUserConfig(configFilePath) : {};

	const ownArgs = {
		...pickNonNil(suitest.configuration.overridableFields, rcConfig),
		...pickNonNil(suitest.configuration.overridableFields, userConfig),
		...pickNonNil(suitest.configuration.overridableFields, argv),
	};
	const userCommandArgs = hideOwnArgs();

	if (askPassword) {
		ownArgs.password = ownArgs.password || await promptPassword();
	}

	return {
		ownArgs,
		userCommandArgs,
	};
};

module.exports = {
	composeConfig,
	readRcConfig,
	readUserConfig,
};
