/**
 * Suitest test launcher logger
 */

const colors = require('colors/safe');
const texts = require('../texts');
const {version} = require('../../package.json');

/**
 * Define custom colors
 */
const stColors = {
	suit: colors.grey,
	mild: colors.cyan,
	bold: colors.cyan.bold,
	errorColor: colors.red,
	successColor: colors.green,
};

/**
 * Prefix log with device id
 * @param {string} devId
 */
function devicePrefix(devId) {
	return devId ? 'Device ' + devId.slice(0, 8) + '> ' : '               > ';
}

const launcherLogger = {
	_: (txt, devId) => console.log(stColors.suit(devicePrefix(devId)) + txt),
	_err: (txt, devId) => console.error(stColors.errorColor(devicePrefix(devId)) + stColors.errorColor(txt)),
	_succ: (txt, devId) => console.log(stColors.successColor(devicePrefix(devId)) + stColors.successColor(txt)),
};

/**
 * Log snipepts
 */
function deviceLines(devicesLines, deviceId, deviceName) {
	launcherLogger._('');
	launcherLogger._(`Test started on ${deviceName ? stColors.bold(deviceName) : deviceId}`);
	deviceName && launcherLogger._(`Device ID: ${deviceId}`);
	devicesLines.forEach(log => launcherLogger[log.type](log.msg, deviceId));
	launcherLogger._(`Test finished on ${deviceName ? stColors.bold(deviceName) : deviceId}`);
}

function argsValidationError(error) {
	launcherLogger._err(error);
	launcherLogger._('');
	launcherLogger._(
		'Try running `suitest --help` to see usage information or consult our docs at https://suite.st/docs'
	);
	launcherLogger._('');
}

function greeting() {
	launcherLogger._('');
	launcherLogger._(
		stColors.mild('Hi there! This is 🍭 ')
		+ stColors.bold(`Suitest v${version}`)
		+ stColors.mild(' test launcher')
	);
	launcherLogger._('');
}

function startOnDevice(deviceId, command, deviceName) {
	launcherLogger._(
		stColors.mild('Starting ')
		+ stColors.bold(`\`${command}\``)
		+ stColors.mild(' for device ')
		// ${device.name} // name not available, logging full deviceId
		+ stColors.bold(`(${deviceName || deviceId})`),
		deviceId
	);
}

function finalAutomated(failedCount, succeededCount) {
	launcherLogger._('');
	launcherLogger._(
		stColors.mild('Test ')
		+ stColors.errorColor(`failed on ${failedCount} device`)
		+ stColors.mild(' and ')
		+ stColors.successColor(`succeeded on ${succeededCount} devices`));
	launcherLogger._('');
}

function finalInteractive(finishedWithErrors) {
	launcherLogger._('');
	finishedWithErrors
		? launcherLogger._err('Test finished with errors')
		: launcherLogger._succ('Test run completed successfully. Bye!');
	launcherLogger._('');
}

function runOnDevices(deviceCount) {
	if (deviceCount) {
		launcherLogger._(stColors.mild(`Will run automated tests on ${deviceCount} devices`));
		launcherLogger._('');
	} else {
		launcherLogger._err(texts['tl.nodevices']());
	}
}

function createTestPack() {
	launcherLogger._(stColors.mild('Creating test pack run...'));
}

module.exports = {
	launcherLogger,
	stColors,
	snippets: {
		argsValidationError,
		deviceLines,
		greeting,
		startOnDevice,
		finalAutomated,
		finalInteractive,
		runOnDevices,
		createTestPack,
	},
};
