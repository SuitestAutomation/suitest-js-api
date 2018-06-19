/**
 * Suitest test launcher logger
 */

const texts = require('../texts');
const {version} = require('../../package.json');
const logger = require('../utils/logger');
const stColors = logger.colors;

/**
 * Log snipepts
 */
function deviceLines(devicesLines, deviceId, deviceName) {
	logger.log('');
	logger.log(`Test started on ${deviceName ? stColors.bold(deviceName) : deviceId}`);
	deviceName && logger.log(`Device ID: ${deviceId}`);
	devicesLines.forEach(log => logger[log.type](log.msg, deviceId));
	logger.log(`Test finished on ${deviceName ? stColors.bold(deviceName) : deviceId}`);
}

function argsValidationError(error) {
	logger.error(error);
	logger.log('');
	logger.log(
		'Try running `suitest --help` to see usage information or consult our docs at https://suite.st/docs'
	);
	logger.log('');
}

function greeting() {
	logger.log('');
	logger.log(
		stColors.mild('Hi there! This is 🍭 ')
		+ stColors.bold(`Suitest v${version}`)
		+ stColors.mild(' test launcher')
	);
	logger.log('');
}

function startOnDevice(deviceId, command, deviceName) {
	logger.log(
		stColors.mild('Starting ')
		+ stColors.bold(`\`${command}\``)
		+ stColors.mild(' for device ')
		// ${device.name} // name not available, logging full deviceId
		+ stColors.bold(`(${deviceName || deviceId})`),
		deviceId
	);
}

function finalAutomated(failedCount, succeededCount) {
	logger.log('');
	logger.log(
		stColors.mild('Test ')
		+ stColors.errorColor(`failed on ${failedCount} device`)
		+ stColors.mild(' and ')
		+ stColors.successColor(`succeeded on ${succeededCount} devices`));
	logger.log('');
}

function finalInteractive(finishedWithErrors) {
	logger.log('');
	finishedWithErrors
		? logger.error('Test finished with errors')
		: logger.success('Test run completed successfully. Bye!');
	logger.log('');
}

function runOnDevices(deviceCount) {
	if (deviceCount) {
		logger.log(stColors.mild(`Will run automated tests on ${deviceCount} devices`));
		logger.log('');
	} else {
		logger.error(texts['tl.nodevices']());
	}
}

function createTestPack() {
	logger.log(stColors.mild('Creating test pack run...'));
}

module.exports = {
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
