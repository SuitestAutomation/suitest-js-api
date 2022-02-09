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
const IS_WIN = process.platform === 'win32';
const HOME_DIR = IS_WIN
	? process.env.USERPROFILE
	: process.env.HOME;

/**
 * @description default directories to search. Logic the same as in rc
 * @type {
	* {
	* path: string,
	* filename: string,
	* deepSearch: boolean,
	* isWin: boolean
	* } []
 * }
 */
const DEFAULT_PATHS = [
	{path: process.cwd(), filename: `.${APP_NAME}rc`, deepSearch: true, isWin: true},
	{path: path.join(HOME_DIR, '.config', APP_NAME), filename: 'config', deepSearch: false, isWin: true},
	{path: path.join(HOME_DIR, '.config'), filename: APP_NAME, deepSearch: false, isWin: true},
	{path: path.join(HOME_DIR, `.${APP_NAME}`), filename: 'config', deepSearch: false, isWin: true},
	{path: HOME_DIR, filename: `.${APP_NAME}rc`, deepSearch: false, isWin: true},

	{path: process.cwd(), filename: `.${APP_NAME}rc`, deepSearch: true, isWin: false},
	{path: path.join(ETC_DIR, APP_NAME), filename: 'config', deepSearch: false, isWin: false},
	{path: ETC_DIR, filename: `${APP_NAME}rc`, deepSearch: false, isWin: false},
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
 * @description Search for configuration files by given path and filename without extension. Can search recursevly.
 * @param {String} pathToSearch path to directory to search
 * @param {String} filename base filename without extension
 * @param {Boolean} shouldSearchDeep boolean value which shows is function should go back to 1 folder up. If true - goes up to the root directory.
 */
function deepDirectorySearch(pathToSearch, filename, shouldSearchDeep) {
	const CONFIG_FORMATS = [
		'.js',
		'.json',
		'.yaml',
		'.yml',
		'.json5',
		'.ini',
	];

	let foundConfigFile = '';

	if (fs.existsSync(pathToSearch)) {
		const files = fs.readdirSync(pathToSearch);

		files.forEach(file => {
			const {name, ext} = path.parse(file);

			if (
				name === filename &&
				(
					CONFIG_FORMATS.includes(ext) ||
					!ext
				)
			) {
				foundConfigFile = path.join(pathToSearch, file);
			}
		});
	}
	if (
		foundConfigFile ||
		!shouldSearchDeep ||
		path.parse(pathToSearch).root === pathToSearch
	) {
		return foundConfigFile;
	}

	return deepDirectorySearch(path.join(pathToSearch, '../'), filename, shouldSearchDeep);
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
		DEFAULT_PATHS
			.filter(defaultConfig => defaultConfig.isWin === IS_WIN)
			.forEach((defultConfig) => {
				if (!mainConfigFilePath && fs.existsSync(defultConfig.path)) {
					mainConfigFilePath = deepDirectorySearch(
						defultConfig.path,
						defultConfig.filename,
						defultConfig.deepSearch,
					);
					if (mainConfigFilePath) {
						foundFiles.push(mainConfigFilePath);
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
	readConfigFile,
	findExtendConfigs,
	composeConfig,
	readRcConfig,
	readUserConfig,
};
