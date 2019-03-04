const semver = require('semver');
const packageJson = require('package-json');
const texts = require('../texts');
const logger = require('./logger');
const {version, name} = require('../../package.json');
const {config} = require('../../config');

const LIB_NAME = name;

/**
 * @description show warning message in terminal if launcher version different from lib version
 * @param {string} libVersion
 * @param {string} launcherVersion
 */
function warnWhenDiffVersions(libVersion, launcherVersion) {
	if (!libVersion || !launcherVersion) {
		return;
	}

	if (!semver.eq(libVersion, launcherVersion)) {
		logger.warn(texts['tl.differentLauncherAndLibVersions'](libVersion, launcherVersion));
	}
}

const warnLauncherAndLibHasDiffVersions = () => warnWhenDiffVersions(version, config.launcherVersion);

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
	// for testing
	warnWhenDiffVersions,
};
