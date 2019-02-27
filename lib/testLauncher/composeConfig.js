const {promptPassword} = require('../utils/testLauncherHelper');
const {pickNonNil} = require('../utils/common');
const {hideOwnArgs} = require('./processArgs');
const {overridableFields} = require('../../config');
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
 * Make sure handler is called only once (yargs bug)
 * @param {Object} argv - yargs cli args object
 * @param {boolean} askPassword - ask for password or not
 * @returns {{config: Object, userCommandArgs: string[]}}
 */
const composeConfig = async(argv, askPassword) => {
	const rcConfig = readRcConfig();
	const configFilePath = argv.configFile || rcConfig.configFile;
	const userConfig = configFilePath ? readUserConfig(configFilePath) : {};

	const config = {
		...pickNonNil(overridableFields, rcConfig),
		...pickNonNil(overridableFields, userConfig),
		...pickNonNil(overridableFields, argv),
	};
	const userCommandArgs = hideOwnArgs();

	if (askPassword) {
		config.password = config.password || await promptPassword();
	}

	return {
		config,
		userCommandArgs,
	};
};

module.exports = {
	composeConfig,
	readRcConfig,
	readUserConfig,
};
