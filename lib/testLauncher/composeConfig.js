// TODO: add test coverage for file

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
const IS_WINDOWS = process.platform === 'win32';
const HOME_DIR = IS_WINDOWS
	? process.env.USERPROFILE
	: process.env.HOME;

const CONFIG_FORMATS = [
	'.js',
	'.json',
	'.yaml',
	'.yml',
	'.json5',
	'.ini',
];

/**
 * @description default directories to search. Logic the same as in rc
 * @type {
	* {
	* path: string,
	* filename: string,
	* deepSearch: boolean,
	* isWindows: boolean
	* } []
 * }
 */
const DEFAULT_PATHS = [
	{path: process.cwd(), filename: `.${APP_NAME}rc`, deepSearch: true, isWindows: true},
	{path: path.join(HOME_DIR, '.config', APP_NAME), filename: 'config', deepSearch: false, isWindows: true},
	{path: path.join(HOME_DIR, '.config'), filename: APP_NAME, deepSearch: false, isWindows: true},
	{path: path.join(HOME_DIR, `.${APP_NAME}`), filename: 'config', deepSearch: false, isWindows: true},
	{path: HOME_DIR, filename: `.${APP_NAME}rc`, deepSearch: false, isWindows: true},

	{path: process.cwd(), filename: `.${APP_NAME}rc`, deepSearch: true, isWindows: false},
	{path: path.join(ETC_DIR, APP_NAME), filename: 'config', deepSearch: false, isWindows: false},
	{path: ETC_DIR, filename: `${APP_NAME}rc`, deepSearch: false, isWindows: false},
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
		case '.js':
			return require(filePath);
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
		throw new SuitestError(circularDependencyError(pathToConfig));
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
 * @description Search for configuration files.
 * @param {String} pathToSearch path to directory to search
 * @param {String} filename base filename without extension
 */
function findConfig(pathToSearch, filename) {
	if (!fs.existsSync(pathToSearch)) {
		return;
	}
	const files = fs.readdirSync(pathToSearch);
	const file = files.find(file => {
		const {name, ext} = path.parse(file);

		return name === filename && (CONFIG_FORMATS.includes(ext) || !ext);
	});

	return file ? path.join(pathToSearch, file) : undefined;
}

/**
 * @description Search for configuration files up to the root.
 * @param {String} pathToSearch path to directory to search
 * @param {String} filename base filename without extension
 */
function findConfigUpToRoot(pathToSearch, filename) {
	const foundConfigFile = findConfig(pathToSearch, filename);

	if (foundConfigFile || path.parse(pathToSearch).root === pathToSearch) {
		return foundConfigFile;
	}

	return findConfigUpToRoot(path.join(pathToSearch, '../'), filename);
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
	let shouldContinueSearch = true;

	if (pathToConfig) {
		mainConfigFilePath = pathToConfig;
	} else {
		DEFAULT_PATHS
			.filter(defaultConfig => defaultConfig.isWindows === IS_WINDOWS)
			.forEach((defultConfig) => {
				if (
					!mainConfigFilePath &&
					fs.existsSync(defultConfig.path) &&
					shouldContinueSearch
				) {
					mainConfigFilePath = (
						defultConfig.deepSearch ?
							findConfigUpToRoot :
							findConfig)(defultConfig.path, defultConfig.filename);
					if (mainConfigFilePath) {
						shouldContinueSearch = false;
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
				[mainConfigFilePath],
			),
			config: mainConfigFilePath,
		};
	}

	return {
		...configFile,
		config: mainConfigFilePath,
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
	readConfigFile,
	findExtendConfigs,
	composeConfig,
	readRcConfig,
	readUserConfig,
};
