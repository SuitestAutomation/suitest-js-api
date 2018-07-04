const semver = require('semver');
const packageJson = require('package-json');
const envVars = require('../constants/enviroment');
const texts = require('../texts');
const logger = require('./logger');
const {version, name} = require('../../package.json');

const LIB_NAME = name;

/**
 * @description get launcher version
 * @returns {string}
 */
function getLauncherVersion() {
	return process.env[envVars.SUITEST_LAUNCHER_VERSION] || '';
}

/**
 * @description show warning message in terminal if launcher version different from lib version
 */
function warnLauncherAndLibHasDiffVersions() {
	const launcherVersion = getLauncherVersion();

	if (!launcherVersion) {
		return;
	}

	if (!semver.eq(version, launcherVersion)) {
		logger.warn(texts['tl.differentLauncherAndLibVersions'](version, launcherVersion));
	}
}

/**
 * @description show warning message in terminal if launcher version not latest
 * @param {string} currentVersion
 * @param {string} latestVersion
 */
function warnNewVersionAvailable(currentVersion, latestVersion) {
	if (!currentVersion || !latestVersion) {
		return;
	}
	if (semver.lt(currentVersion, latestVersion)) {
		logger.warn(texts['tl.newVersionAvailable'](latestVersion));
	}
}

/**
 * @description fetch package latest version
 * @returns {Promise<*|string>}
 */
async function fetchLatestSuitestVersion() {
	// fetch package metadata from https://registry.npmjs.org/
	const packageMetadata = await packageJson(LIB_NAME);

	return packageMetadata.version || '';
}

module.exports = {
	warnLauncherAndLibHasDiffVersions,
	fetchLatestSuitestVersion,
	warnNewVersionAvailable,
};
