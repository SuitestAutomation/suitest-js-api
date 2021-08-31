const {promptPassword} = require('../utils/testLauncherHelper');
const {pickNonNil} = require('../utils/common');
const {hideOwnArgs} = require('./processArgs');
const suitest = require('../../index');
const fs = require('fs');
const SuitestError = require('../utils/SuitestError');
const {invalidUserConfig} = require('../texts');
const yaml = require('js-yaml');
const JSON5 = require('json5');
const ini = require('ini');
const path = require('path');

const APP_NAME = 'suitest';
const ROOT_PATH = path.resolve('/');
const ETC_DIR = '/etc';
const IS_WIN = process.platform === 'win32';
const HOME_DIR = IS_WIN
	? process.env.USERPROFILE
	: process.env.HOME;

const configFiles = [
	`.${APP_NAME}rc.js`,
	`.${APP_NAME}rc.json`,
	`.${APP_NAME}rc.yaml`,
	`.${APP_NAME}rc.yml`,
	`.${APP_NAME}rc.json5`,
	`.${APP_NAME}rc.ini`,
	`.${APP_NAME}rc`,
];

const lookupDirs = [
	process.cwd(),
	path.join(HOME_DIR, `.${APP_NAME}rc`),
	path.join(HOME_DIR, `.${APP_NAME}`, 'config'),
	path.join(HOME_DIR, '.config', APP_NAME),
	path.join(HOME_DIR, '.config', APP_NAME, 'config'),
	path.join(ETC_DIR, `.${APP_NAME}rc`),
	path.join(ETC_DIR, APP_NAME, 'config'),
];

/**
 * Recursive search in directory and subdirectories
 * @param {String} directory directory, from which search will be started
 * @param {Array} foundFiles array to which found results will be saved
 * @param {Array} configFiles array of filenames to search
 */
function directorySearch(directory, foundFiles, configFiles) {
	fs.readdirSync(directory).forEach(file => {
		if (configFiles.includes(file)) {
			const absolute = path.join(directory, file);

			foundFiles.push(absolute);
		}
	});

	if (directory !== ROOT_PATH) {
		return directorySearch(path.dirname(directory), foundFiles, configFiles);
	}
}

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

	let foundFiles = [];
	const configObject = {};

	lookupDirs.forEach((projectDir) => {
		if (projectDir === process.cwd()) {
			directorySearch(projectDir, foundFiles, configFiles);
		} else if (fs.existsSync(projectDir)) {
			const files = fs.readdirSync(projectDir)
				.filter(fileName => configFiles.includes(fileName))
				.map(file => path.join(projectDir, file));

			foundFiles = [...foundFiles, ...files];
		}
	});

	foundFiles.forEach((filePath) => {
		const readFile = fs.readFileSync(filePath, 'utf8');
		let configurationData = {};

		switch (filePath) {
			case filePath.endsWith('.yaml' || '.yml'):
				configurationData = yaml.safeLoad(readFile);
				break;
			case filePath.endsWith('json5'):
				configurationData = JSON5.parse(readFile);
				break;
			case filePath.endsWith('ini'):
				configurationData = ini.parse(readFile);
				break;
			default:
				configurationData = JSON.parse(readFile);
				break;
		}

		Object.keys(configurationData).forEach((objKey) => {
			configObject[`${objKey}`] = configurationData[objKey];
		});
	});

	configObject.configs = foundFiles;
	configObject.config = foundFiles[0];

	return configObject;
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
