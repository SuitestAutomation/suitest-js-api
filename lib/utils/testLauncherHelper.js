const read = require('read');
const ramda = require('ramda');
const path = require('path');
const moment = require('moment');
const cp = require('child_process');
const keypress = require('keypress');
const net = require('net');

const validation = require('../validataion');
const launcherHelper = require('../utils/launcherLoggerHelper');
const {snippets: log} = require('../testLauncher/launcherLogger');
const logger = require('../utils/logger');
const texts = require('../texts');

const Queue = require('../utils/Queue');
const {registerProcess} = require('../testLauncher/processReaper');
const {config} = require('../../config');
const {startTestPackUnchained} = require('../commands/startTestPack');
const envVars = require('../constants/enviroment');
const {closeSessionUnchained} = require('../commands/closeSession');

const {version} = require('../../package.json');
const {stripAnsiChars} = require('../utils/stringUtils');

const {AUTOMATED, INTERACTIVE, TEST_COMMAND} = require('../constants/modes');
const {REPL_START, REPL_STOP, REPL_INIT} = require('../constants/repl');
const {mergeWith, isNil} = ramda;

const {fetchLatestSuitestVersion, warnNewVersionAvailable} = require('../utils/packageMetadataHelper');
const SuitestError = require('../utils/SuitestError');

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
 * Validate test launcher's args based on session type
 * @param {String} type session type "AUTOMATED" or "INTERACTIVE", "TEST_COMMAND"
 * @param {Object} args test launcher arguments
 */
function validateInput(type, args) {
	try {
		const msg = type === TEST_COMMAND
			? texts['errorType.suitestTestCommand']
			: texts['errorType.suitestCommand'](type.toLowerCase());

		validation.validate(
			validation.validators[`TEST_LAUNCHER_${type}`],
			args, msg
		);
	} catch (error) {
		log.argsValidationError(error);

		return process.exit(1);
	}
}
/* istanbul ignore next  */
function getLogFilePath(deviceId, deviceName, startTime, logDir) {
	const [shortId] = deviceId.split('-');
	const shortName = deviceName.replace(/[^a-z0-9]/ig, '-');
	const timePrefix = moment(startTime).format('YYYYMMD-HHmmSS');
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
function getDeviceLogStream(device, userArgs, startTime, logDir) {
	let writeStream = null;

	const {deviceId} = device;
	const deviceName = device.manufacturer + ' ' + device.model;

	if (!logDir)
		return writeStream;

	/* istanbul ignore next  */
	try {
		const logPath = getLogFilePath(deviceId, deviceName, startTime, logDir);

		launcherHelper.mkDirByPathSync(logDir);
		writeStream = launcherHelper.createWriteStream(logPath);
	} catch (e) {
		/* istanbul ignore if  */
		if (e.exit) {
			e.exit();
		} else {
			logger.error(e);
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

	/* istanbul ignore if  */
	if (debugPort && runMode === AUTOMATED) {
		logger.error(texts['tl.inspectOnlyForInteractiveMode']());
		process.exit(1);
	}

	return debugPort;
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
		args.unshift('--inspect-brk');
		args.unshift(`--inspect${inspectBrk ? '-brk' : ''}=${debugPort}`);
	}

	if (runMode === INTERACTIVE) {
		options.stdio = 'pipe';
		options.env.REPL_IPC_PORT = await setupReplIpc();
	}

	return cp.spawn(
		command,
		args,
		options
	);
}

/**
 * Save child output to the file
 * @param {ChildProcess} child
 * @param {Buffer} chunk
 * @param {WritableStream} [logStream]
 */
function logOutput(child, chunk, logStream) {
	logStream && logStream.write(stripAnsiChars(chunk.toString()));
}

/**
 * When running repl in the spawned subprocess process.stdin.setRawMode(true)
 * needs to be called to enable sending terminal codes.
 * When repl ends the node process for some reason does not want to take over
 * the ownership of the terminal anymore (setRawMode(false) does not help).
 * This function manually enables ctrl+c togther with the keypress module
 * @param {string} ch
 * @param {Object} key
 */
function keypressListener(ch, key) {
	/* istanbul ignore next  */
	if (key.name === 'c' && key.ctrl)
		process.emit('SIGINT');
}

/**
 * Handles positive IPC communication
 * @param {Buffer} chunk
 * @param {net.Socket} socket
 */
function onIpcMessage(chunk, socket) {
	const msg = chunk.toString();

	logger.debug('REPL control message received', msg);

	if (msg === REPL_START) {
		process.stdin.removeListener('keypress', keypressListener);
		if (process.stdout.isTTY) {
			process.stdin.setRawMode(true);
		} else {
			logger.warn(texts.replNotATty());
		}
		process.stdin.resume();
		socket.write(`${REPL_INIT}|${+process.stdout.isTTY}`);
	} else if (msg === REPL_STOP) {
		process.stdin.addListener('keypress', keypressListener);
	}
}

/**
 * Subprocess needs to let the main process know when it starts and ends the
 * REPL session. This function sets up the IPC server in the main process to
 * which the child will report the REPL status.
 */
function setupReplIpc() {
	const server = net.createServer();

	server.on('connection', socket => {
		socket
			.unref()
			.on('data', chunk => onIpcMessage(chunk, socket))
			.on('error', err => logger.debug('Error on IPC socket:', err));
	});

	/* istanbul ignore next  */
	server.on('error', err => {
		if (err.errno === 'EADDRINUSE') {
			throw new SuitestError(
				texts.replFailedToCreateIpc(server.address().port),
				SuitestError.IPC_ERROR
			);
		}

		logger.debug('Error on IPC server', err);
	});

	server.unref();

	return new Promise((resolve, reject) => {
		server.listen(0, 'localhost', err => {
			err ? reject(err) : resolve(server.address().port);
		});
	});
}

/**
 *
 * @param {ChildProcess} child - the child process instance running the test
 * @param {Function} onExit - callback function to call when the process finishes
 * @param {WritableStream} logStream - the output stream of the child process.
 * @param {String} runMode - suitest test execution mode
 */
function attachIO(child, onExit, logStream, runMode) {
	const [childIn, childOut, childErr] = child.stdio;
	const logIo = chunk => logOutput(child, chunk, logStream);

	registerProcess(child);

	// in interactive mode pipe stdin so that console is not confused by REPL
	if (runMode === INTERACTIVE) {
		keypress(process.stdin);
		process.stdin.pipe(childIn);
		childIn.on('data', logIo);
	}

	// Always pipe child's out and err io.
	childOut.pipe(process.stdout);
	childErr.pipe(process.stdout);

	childOut.on('data', logIo);
	childErr.on('data', logIo);

	child.on('exit', onExit);
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
	const logStream = getDeviceLogStream(device, cmdArgv, new Date(), logDir);

	return new Promise(resolve => {
		logStream && logStream.write(texts.fileLogSummary(
			cmdArgv.join(' '),
			ownArgv.orgId,
			ownArgv.appConfigId,
			runMode === AUTOMATED ? ownArgv.testPackId : '',
			new Date()
		));

		const onExit = (exitCode, signal) => {
			logStream && logStream.write(texts.fileLogCompleted(
				exitCode, signal
			));
			resolve(exitCode, signal);
		};

		attachIO(child, onExit, logStream, runMode);
	});
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
		NODE_NO_READLINE: 1, // enable repl in advanced consoles
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
	handleLauncherError,
	handleChildResult,
	promptPassword,
	mergeConfigs,
	validateInput,
	prepareTestPackExecution,
	runTestOnDevice,
	runAllDevices,
	finishInteractive,
	getVersion,
	setupReplIpc,
};
