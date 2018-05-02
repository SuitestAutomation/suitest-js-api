/**
 * Suitest test launcher logger
 */

const colors = require('colors/safe');
const texts = require('../texts');
const {version} = require('../../package.json');
const fs = require('fs');
const path = require('path');
const SuitestError = require('../utils/SuitestError');

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
function deviceLines(devicesLines, deviceId) {
	launcherLogger._('');
	launcherLogger._(`Test started on device: ${deviceId.slice(0, 8)}`);
	devicesLines.forEach((log) => launcherLogger[log.type](log.msg, deviceId));
	launcherLogger._(`Test finished on device: ${deviceId.slice(0, 8)}`);
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

function startOnDevice(deviceId, command, logDir) {
	let writeStream = null;

	if (logDir) {
		mkDirByPathSync(logDir);
		writeStream = createWriteStream(logDir, deviceId);
		launcherLogger._succ(texts['tl.startLogRecording'](logDir, deviceId));
	}
	launcherLogger._(
		stColors.mild('Starting ')
		+ stColors.bold(`\`${command}\``)
		+ stColors.mild(' for device ')
		// ${device.name} // name not available, logging full deviceId
		+ stColors.bold(`(${deviceId})`),
		deviceId
	);

	return writeStream;
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

function createWriteStream(path, deviceId) {
	const pathToFile = path + `/${deviceId}.log`;

	if (fs.existsSync(pathToFile)) {
		fs.unlinkSync(pathToFile);
	}

	return fs.createWriteStream(path + `/${deviceId}.log`, {flags: 'ax'});
}

function mkDirByPathSync(targetDir) {
	const sep = path.sep;
	const initDir = path.isAbsolute(targetDir) ? sep : '';
	const baseDir = '.';

	targetDir.split(sep).reduce((parentDir, childDir) => {
		const curDir = path.resolve(baseDir, parentDir, childDir);

		try {
			fs.mkdirSync(curDir);
		} catch (err) {
			if (err.code !== 'EEXIST') {
				throw new SuitestError(
					texts['tl.failedToCreateDir'],
					SuitestError.UNKNOWN_ERROR,
				);
			}
		}

		return curDir;
	}, initDir);
}

module.exports = {
	launcherLogger,
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
