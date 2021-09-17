// TODO: add test coverage for file
/* istanbul ignore file */
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

const PRESETS = 'presets';
const APP_NAME = 'suitest';
const ROOT_PATH = path.resolve('/');
const ETC_DIR = '/etc';
const IS_WIN = process.platform === 'win32';
const HOME_DIR = IS_WIN
	? process.env.USERPROFILE
	: process.env.HOME;

const CONFIG_FILES = [
	`.${APP_NAME}rc.js`,
	`.${APP_NAME}rc.json`,
	`.${APP_NAME}rc.yaml`,
	`.${APP_NAME}rc.yml`,
	`.${APP_NAME}rc.json5`,
	`.${APP_NAME}rc.ini`,
	`.${APP_NAME}rc`,
];

/**
 * @description should repeat lookup logic from rc library
 * @type {string[]}
 */
const LOOKUP_DIRS = [
	path.join(HOME_DIR, `.${APP_NAME}rc`),
	path.join(HOME_DIR, `.${APP_NAME}`, 'config'),
	path.join(HOME_DIR, '.config', APP_NAME),
	path.join(HOME_DIR, '.config', APP_NAME, 'config'),
	path.join(ETC_DIR, `.${APP_NAME}rc`),
	path.join(ETC_DIR, APP_NAME, 'config'),
	process.cwd(),
];

/**
 * @description Recursive search upward in directory
 * @param {String} directory directory, from which search will be started
 * @param {Array} configFiles array of filenames to search
 */
function directorySearch(directory, configFiles) {
	const files = fs.readdirSync(directory).reduce((res, file) => {
		if (configFiles.includes(file)) {
			const absolute = path.join(directory, file);

			res.push(absolute);
		}

		return res;
	}, []);

	if (directory === ROOT_PATH) {
		return files;
	}

	return files.concat(directorySearch(path.dirname(directory), configFiles));
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

	LOOKUP_DIRS.forEach((projectDir) => {
		if (projectDir === process.cwd()) {
			const files = directorySearch(projectDir, CONFIG_FILES);

			foundFiles = [...foundFiles, ...files];
		} else if (fs.existsSync(projectDir)) {
			const files = fs.readdirSync(projectDir)
				.filter(fileName => CONFIG_FILES.includes(fileName))
				.map(file => path.join(projectDir, file));

			foundFiles = [...foundFiles, ...files];
		}
	});

	foundFiles.forEach((filePath) => {
		const fileContent = fs.readFileSync(filePath, 'utf8');
		let configurationData = {};

		switch (path.extname(filePath)) {
			case '.yaml':
			case '.yml':
				configurationData = yaml.load(fileContent);
				break;
			case '.json5':
				configurationData = JSON5.parse(fileContent);
				break;
			case '.ini':
				configurationData = ini.parse(fileContent);
				break;
			default:
				try {
					configurationData = JSON.parse(fileContent);
				} catch (error) {
					configurationData = ini.parse(fileContent);
				}
				break;
		}

		Object.keys(configurationData).forEach((objKey) => {
			if (objKey === PRESETS) {
				configObject.presets = {...configObject[objKey], ...configurationData[objKey]};
			} else {
				configObject[objKey] = configurationData[objKey];
			}
		});
	});

	configObject.configs = foundFiles;
	configObject.config = foundFiles[0];

	return configObject;
}

/**
 * Read json config file provided by user.
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
 * @returns {{ownArgs: Object, userCommandArgs: string[]}}
 */
const composeConfig = (argv) => {
	const rcConfig = readRcConfig();
	const configFilePath = argv.configFile || rcConfig.configFile;
	const userConfig = configFilePath ? readUserConfig(configFilePath) : {};

	const ownArgs = {
		...pickNonNil(suitest.configuration.overridableFields, rcConfig),
		...pickNonNil(suitest.configuration.overridableFields, userConfig),
		...pickNonNil(suitest.configuration.overridableFields, argv),
	};
	const userCommandArgs = hideOwnArgs();

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
