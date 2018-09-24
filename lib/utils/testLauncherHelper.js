const read = require('read');
const ramda = require('ramda');
const readline = require('readline');
const path = require('path');
const moment = require('moment');
const cp = require('child_process');
const {EOL} = require('os');

const validation = require('../validataion');
const launcherHelper = require('../utils/launcherLoggerHelper');
const {snippets: log} = require('../testLauncher/launcherLogger');
const logger = require('../utils/logger');
const timestamp = require('../utils/timestamp');
const texts = require('../texts');

const Queue = require('../utils/Queue');
const {registerProcess} = require('../testLauncher/processReaper');
const {config} = require('../../config');
const {stripAnsiChars} = require('../utils/stringUtils');
const {startTestPackUnchained} = require('../commands/startTestPack');
const envVars = require('../constants/enviroment');
const {closeSessionUnchained} = require('../commands/closeSession');

const {version} = require('../../package.json');

const AUTOMATED = 'automated';
const INTERACTIVE = 'interactive';

const {mergeWith, isNil} = ramda;
const {normalize} = path;

const {fetchLatestSuitestVersion, warnNewVersionAvailable} = require('../utils/packageMetadataHelper');

let suitestVersion = '';

/**
 * Handle test launcher command error
 * @param {Error} error
 */
function handleLauncherError(error) {
	if (error.exit) {
		error.exit(1, logger);
	} else {
		logger.error(error);
		process.exit(1);
	}
}

/**
 * Handle test launcher child process result
 * @param {boolean} finishedWithErrors
 */
function handleChildResult(finishedWithErrors) {
	if (finishedWithErrors) {
		process.exit(1);
	} else {
		process.exit(0);
	}
}

/**
 * Prompt user password.
 * If nothing provided, ask again.
 */
function promptPassword() {
	return new Promise((resolve) => read({
		prompt: texts['tl.promptPassword'](),
		silent: true,
		replace: '*',
	}, (err, pass) => {
		/* istanbul ignore if */
		if (err) {
			// prompt dismissed with CTRL+C or the like.
			process.stdout.write('\n');
		} else if (!pass) {
			resolve(promptPassword());
		} else {
			resolve(pass);
		}
	}));
}

/**
 * Merge configs. If value is not null or undefined in configB - take it
 *  otherwise, take value from configA
 *
 * @param {Object} configA - base config
 * @param {Object} configB - config to extend with
 * @returns {Object}
 */
function mergeConfigs(configA, configB) {
	return mergeWith(
		(a, b) => isNil(b) ? a : b,
		configA,
		configB,
	);
}

/**
 * Create readline interface for child process, execute callback on 'line' event
 * @param {Object} child node child process
 * @param {Function} callback callback function
 * @param {string} std std output file: 'stdout' | 'stderr' | 'stdin'
 */
function createReadLineInterface(child, callback, std) {
	readline.createInterface({
		input: child[std],
		terminal: false,
	}).on('line', line => {
		callback(line.toString());
	});
}

/**
 * Read child process stdout and stderr, apply callback function on each line
 * @param {Object} child node child process
 * @param {Function} callback callback function
 */
function followChildProcess(child, callback) {
	createReadLineInterface(child, callback, 'stdout');
	createReadLineInterface(child, callback, 'stderr');
}

/**
 * Validate test launcher's args based on session type
 * @param {String} type session type "AUTOMATED" or "INTERACTIVE"
 * @param {Object} args test launcher arguments
 */
function validateInput(type, args) {
	try {
		validation.validate(
			validation.validators[`TEST_LAUNCHER_${type}`],
			args, `provided for 'suitest ${type.toLowerCase()}' command. It`
		);
	} catch (error) {
		log.argsValidationError(error);

		return process.exit(1);
	}
}

function createLogFilePath(deviceId, deviceName, startTime, logDir) {
	const [shortId] = deviceId.split('-');
	const shortName = deviceName.replace(/[^a-z0-9]/ig, '-');
	const timePrefix = moment(startTime).format('YYYYMMD-HHMMSS');
	const fileName = `${timePrefix}-${shortId}-${shortName}.log`;

	return `${path.resolve(logDir)}${path.sep}${fileName}`;
}

/**
 * If logDir specified creates and return writeStream
 * @param {Object} device
 * @param {array} userArgs
 * @param startTime
 * @param {string} [logDir]
 * @returns {WritableStream}
 */
function writeLogs(device, userArgs, startTime, logDir) {
	let writeStream = null;

	const {deviceId} = device;
	const deviceName = device.manufacturer + ' ' + device.model;

	if (!logDir)
		return writeStream;

	try {
		const logPath = createLogFilePath(deviceId, deviceName, startTime, logDir);

		launcherHelper.mkDirByPathSync(logDir);
		writeStream = launcherHelper.createWriteStream(logPath);
	} catch (e) {
		if (e.exit) {
			e.exit();
		} else {
			logger.error(e, deviceName);
			process.exit(1);
		}
	}

	return writeStream;
}

/**
 * Verify the debug port parameter
 *
 * @param {Object} ownArgw - implicitly derived launched parameters
 * @param {String} runMode - Suitest test execution mode (interactive|automated)
 * @returns {String}
 */
function getDebugPort(ownArgw, runMode) {
	const {inspect, inspectBrk} = ownArgw;
	const debugPort = inspectBrk || inspect;

	if (debugPort && runMode === AUTOMATED) {
		logger.error(texts['tl.inspectOnlyForInteractiveMode']());
		process.exit(1);
	}

	return debugPort;
}

/**
 * Manages io produced by the child process.
 *
 * @param {ChildProcess} child - the child process instance
 * @param {Object} device - full device information
 * @param {Array} cmdArgv - user command with arguments
 * @param {String} logDir - path to the logs directory
 * @param {String} runMode - Suitest run mode (interactive|automated)
 * @param {Function} onFinished - the callback to call when process finishes
 * @return {WritableStream|null} log file stream.
 */
function watchChild(child, device, cmdArgv, logDir, runMode, onFinished) {
	const startTime = new Date();
	const writeStream = writeLogs(
		device, cmdArgv, startTime, logDir, runMode
	);

	child.on('close', onFinished);

	registerProcess(child);
	followChildProcess(child, msg => {
		if (writeStream)
			writeStream.write(timestamp() + ' ' + stripAnsiChars(msg) + EOL);

		logger.log(msg, device);
	});

	return writeStream;
}

/**
 * Creates new process instance for the test execution on a device.
 * @param {Array} cmdArgv - user test command and it's parameters
 * @param {Object} ownArgv - implicitly derived launcher parameters
 * @param {Object} options - child process environment options
 * @param {String} runMode - suitest execution mode (interactive|automated)
 */
async function launchChild(cmdArgv, ownArgv, options, runMode) {
	const {inspectBrk} = ownArgv;
	const debugPort = getDebugPort(ownArgv, runMode);
	const [command, ...args] = cmdArgv;

	if (debugPort) {
		const debugArgs = `--inspect${inspectBrk ? '-brk' : ''}=${debugPort}`;

		return cp.fork(command, args, {
			...options,
			execArgv: [
				debugArgs,
			],
			cwd: normalize(process.cwd()),
			execPath: normalize(process.execPath),
			silent: true,
		});
	}

	return cp.spawn(
		command,
		args,
		options
	);
}

/**
 * Initiates test execution on a device
 *
 * @param {Array} cmdArgv - user test command and it's parameters
 * @param {Object} ownArgv - implicitly derived launcher parameters
 * @param {Object} device - full device information
 * @param {String} deviceAccessToken - temporary device access token obtained from server
 * @param {String} runMode - Suitest execution mode (interactive|automated)
 * @returns {Promise<any>}
 */
async function runTestOnDevice(cmdArgv, ownArgv, device, deviceAccessToken, runMode) {
	const debugPort = getDebugPort(ownArgv, runMode);
	const {deviceId} = device;
	const {logDir, appConfigId} = ownArgv;

	const options = getChildOptions(
		deviceId, deviceAccessToken, appConfigId, debugPort, runMode
	);
	const child = await launchChild(cmdArgv, ownArgv, options, runMode);

	return new Promise(
		resolve => {
			const logStream = watchChild(
				child, device, cmdArgv, logDir, runMode, resolve
			);

			if (logStream) {
				logStream.write(texts.fileLogSummary(
					cmdArgv.join(' '),
					ownArgv.orgId,
					ownArgv.appConfigId,
					runMode === AUTOMATED ? ownArgv.testPackId : '',
					new Date()
				));
			}
		}
	);
}

/**
 * Prepares environment for the child process.
 *
 * @param {String} deviceId - id of the device
 * @param {String} deviceAccessToken - temporary accessToken obtained from server.
 * @param {String} appConfigId - app configuration id.
 * @param {Boolean} isDebugMode - flag determining if launcher should expect debugger attaching.
 * @param {String} runMode - suitest execution mode (interactive|automated)
 * @returns {{shell: boolean, env: Object}}
 */
function getChildOptions(deviceId, deviceAccessToken, appConfigId, isDebugMode, runMode) {
	const env = {
		...process.env,
		// Use string value to avoid confusion with type casting
		// Over several NodeJS versions
		[envVars.SUITEST_CLOSE_SESSION]: 'no',
		[envVars.SUITEST_SESSION_TYPE]: runMode,
		[envVars.SUITEST_SESSION_TOKEN]: deviceAccessToken,
		[envVars.SUITEST_DEVICE_ID]: deviceId,
		[envVars.SUITEST_APP_CONFIG_ID]: appConfigId,
		[envVars.SUITEST_DEBUG_MODE]: isDebugMode ? 'yes' : 'no',
		[envVars.SUITEST_CONFIG_LOG_LEVEL]: config.logLevel,
		[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS]: config.disallowCrashReports,
		[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR]: config.continueOnFatalError,
		[envVars.SUITEST_LAUNCHER_VERSION]: version,
		FORCE_COLOR: true,
	};

	return {
		shell: true,
		env,
	};
}

/**
 * Prepares data for execution of the test pack
 *
 * @param {Object} ownArgv - implicitly derived launcher paratemers
 * @returns {Promise<{devices, deviceAccessToken: *}>}
 */
async function prepareTestPackExecution(ownArgv) {
	const {tokenKey, tokenPassword, testPackId} = ownArgv;

	const testPackInfo = await startTestPackUnchained({
		accessTokenKey: tokenKey,
		accessTokenPassword: tokenPassword,
		testPackId,
	});

	const {pluck, path} = ramda;
	const {deviceAccessToken} = testPackInfo;
	const devices = pluck('deviceId', path(['testPack', 'devices'], testPackInfo));
	const deviceCount = devices.length;

	if (!deviceCount) {
		await closeSessionUnchained();
		process.exit(1);
	}

	return {
		devices,
		deviceAccessToken,
	};
}

/**
 * Runs test pack on all devices in automated mode
 *
 * @param {Array} cmdArgv - user command and it's arguments
 * @param {Object} ownArgv - implicitly derived parameters
 * @param {Array} devices - array with items containing full device information
 * @param {String} deviceAccessToken - temporary device access token obtained from server
 * @returns {Promise<*>}
 */
function runAllDevices(cmdArgv, ownArgv, devices, deviceAccessToken) {
	const tests = devices.map(device => () => runTestOnDevice(
		cmdArgv, ownArgv, device, deviceAccessToken, AUTOMATED
	));

	const queue = new Queue(ownArgv.concurrency, tests);

	logger.intro(
		texts.launcherSummaryAutomated,
		ownArgv.testPackId,
		cmdArgv.join(' '),
		ownArgv.logDir,
		...devices.map(device => device.displayName)
	);

	return queue.start().then(result => {
		const failedDevices = result.filter(
			res => {
				const code = res.result.code || res.result;

				return res.result.error || code !== 0;
			}
		);

		log.finalAutomated(failedDevices.length, result.length - failedDevices.length);
		warnNewVersionAvailable(version, suitestVersion);
		handleChildResult(failedDevices.length - result.length >= 0);
	});
}

/**
 * Completing steps for interactive run
 *
 * @param {Boolean} withError
 */
function finishInteractive(withError) {
	log.finalInteractive(withError);
	warnNewVersionAvailable(version, suitestVersion);
	handleChildResult(withError);
}

/**
 * Get's the version of the latest published suitest-js-api package
 * @returns {Promise<String>}
 */
async function getVersion() {
	suitestVersion = await fetchLatestSuitestVersion();

	return suitestVersion;
}

module.exports = {
	AUTOMATED,
	INTERACTIVE,
	handleLauncherError,
	handleChildResult,
	promptPassword,
	mergeConfigs,
	followChildProcess,
	validateInput,
	writeLogs,
	prepareTestPackExecution,
	runTestOnDevice,
	runAllDevices,
	finishInteractive,
	getVersion,
};
