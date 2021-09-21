// TODO: add test coverage for file
/* istanbul ignore file */
const {pickNonNil} = require('../utils/common');
const {hideOwnArgs} = require('./processArgs');
const suitest = require('../../index');
const fs = require('fs');
const SuitestError = require('../utils/SuitestError');
const {
	invalidUserConfig,
	circularDependencyError,
} = require('../texts');
const yaml = require('js-yaml');
const JSON5 = require('json5');
const ini = require('ini');
const path = require('path');

const PRESETS = 'presets';
const APP_NAME = 'suitest';
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
 * @description Reads file from path and returns file as an object. Supports json, yaml, json5 and ini formats.
 * @param {String} filePath path to file
 */
function readConfigFile(filePath) {
	const fileContent = fs.readFileSync(filePath, 'utf8');

	switch (path.extname(filePath)) {
		case '.yaml':
		case '.yml':
			return yaml.load(fileContent);
		case '.json5':
			return JSON5.parse(fileContent);
		case '.ini':
			return ini.parse(fileContent);
		default:
			try {
				return JSON.parse(fileContent);
			} catch (error) {
				return ini.parse(fileContent);
			}
	}
}

/**
 * @description Recursive search and merging for Extends configs
 * @param {object} defaultConfigObject main configuration file object
 * @param {String} extendPath extend path of other configuration file to merge with
 * @param {String} filePath currently in read configuration file path
 * @param {Array} foundPaths array of extends paths. Used to verify circular dependency
 */
function findExtendConfigs(defaultConfigObject, extendPath, filePath, foundPaths) {
	const pathToConfig = path.join(path.dirname(filePath), extendPath);

	if (foundPaths.includes(pathToConfig)) {
		throw new SuitestError(circularDependencyError(pathToConfig), 404);
	}

	const additionalConfigFile = readConfigFile(pathToConfig);
	const mainConfigFile = {...additionalConfigFile};

	Object.keys(defaultConfigObject).forEach((objKey) => {
		if (objKey === PRESETS) {
			mainConfigFile.presets = {...mainConfigFile[objKey], ...defaultConfigObject[objKey]};
		} else {
			mainConfigFile[objKey] = defaultConfigObject[objKey];
		}
	});

	if ('extends' in additionalConfigFile) {
		return findExtendConfigs(
			mainConfigFile,
			additionalConfigFile.extends,
			pathToConfig,
			[...foundPaths, pathToConfig],
		);
	}

	return mainConfigFile;
}

/**
 * Read `.suitestrc` launcher config file.
 * If file not found, return empty object.
 * Supports json and ini formats.
 * cli arguments are not parsed.
 * If file found, but json invalid, throw error.
 * @returns {Object}
 */
function readRcConfig(pathToConfig) {
	let mainConfigFilePath = '';
	const foundFiles = [];

	if (pathToConfig) {
		foundFiles.push(pathToConfig);
		mainConfigFilePath = pathToConfig;
	} else {
		LOOKUP_DIRS.forEach((projectDir) => {
			if (!mainConfigFilePath && fs.existsSync(projectDir)) {
				const files = fs.readdirSync(projectDir)
					.filter(fileName => CONFIG_FILES.includes(fileName))
					.map(file => path.join(projectDir, file));

				if (files.length > 0) {
					mainConfigFilePath = files[0];
					foundFiles.push(files[0]);
				}
			}
		});
	}

	if (!mainConfigFilePath) {
		return {};
	}

	const configFile = readConfigFile(mainConfigFilePath);

	if ('extends' in configFile) {
		return {
			...findExtendConfigs(
				configFile,
				configFile.extends,
				mainConfigFilePath,
				[foundFiles[0]],
			),
			configs: foundFiles,
			config: foundFiles[0],
		};
	}

	return {
		...configFile,
		configs: foundFiles,
		config: foundFiles[0],
	};
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
	const rcConfig = readRcConfig(argv.configFile);
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
