const read = require('read');
const ramda = require('ramda');
const path = require('path');
const moment = require('moment');
const cp = require('child_process');
const keypress = require('keypress');

const validation = require('../validataion');
const launcherHelper = require('./launcherLoggerHelper');
const {snippets: log} = require('../testLauncher/launcherLogger');
const logger = require('./logger');
const texts = require('../texts');

const Queue = require('./Queue');
const {registerProcess} = require('../testLauncher/processReaper');
const {startTestPackUnchained} = require('../commands/startTestPack');
const envVars = require('../constants/enviroment');

const {version} = require('../../package.json');
const {stripAnsiChars} = require('./stringUtils');

const {AUTOMATED, INTERACTIVE, TEST_COMMAND} = require('../constants/modes');

const {fetchLatestSuitestVersion, warnNewVersionAvailable} = require('./packageMetadataHelper');
const SuitestError = require('./SuitestError');
const t = require('../texts');

const ipcServer = require('../testLauncher/ipc/server');
const messageId = require('../constants/ipcMessageId');

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
 * Validate test launcher's args based on session type
 * @param {string} type session type "AUTOMATED" or "INTERACTIVE", "TEST_COMMAND"
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
	const timePrefix = moment(startTime).format('YYYYMMDD-HHmmss');
	const fileName = `${timePrefix}-${shortId}-${shortName}.log`;

	return `${path.resolve(logDir)}${path.sep}${fileName}`;
}

/**
 * If logDir specified creates and returns writeStream
 * @param {Object} device
 * @param {Array} userArgs
 * @param {Date} startTime
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
 * Verify the debug port parameter, can be port number, boolean or undefined
 * @param {Object} launcherOptions - implicitly derived launched parameters
 * @returns {number|undefined|boolean}
 */
function getDebugPort(launcherOptions) {
	return launcherOptions.inspectBrk || launcherOptions.inspect;
}

/**
 * Throw error and exit process when user wants to run debugging in automated session
 */
function throwDebugInAutomatedError() {
	logger.error(texts['tl.inspectOnlyForInteractiveMode']());
	process.exit(1);
}

/**
 * Creates new process instance for the test execution on a device.
 * @param {Array} cmdArgv - user test command and it's parameters
 * @param {Object} ownArgv - implicitly derived launcher parameters
 * @param {Object} options - child process environment options
 * @param {string} sessionType - suitest execution mode (interactive|automated)
 * @returns {ChildProcess} - spawned child process
 */
async function launchChild(cmdArgv, ownArgv, options, sessionType) {
	const {inspectBrk} = ownArgv;
	const [command, ...args] = cmdArgv;
	const debugPort = getDebugPort(ownArgv);

	if (debugPort) {
		args.unshift('--inspect-brk');
		args.unshift(`--inspect${inspectBrk ? '-brk' : ''}=${debugPort}`);
	}

	if (sessionType === INTERACTIVE) {
		options.stdio = 'pipe';
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
 * When repl ends the node process for some reason does not want to take` over
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
 * Add launcher process IPC message listeners
 */
function addLauncherIpcListeners() {
	ipcServer.addListener(messageId.REPL_START, () => {
		process.stdin.removeListener('keypress', keypressListener);
		if (process.stdout.isTTY) {
			process.stdin.setRawMode(true);
		} else {
			logger.warn(texts.replNotATty());
		}
		process.stdin.resume();
		ipcServer.broadcast(messageId.REPL_INIT, {isTTY: !!process.stdout.isTTY});
	});
	ipcServer.addListener(messageId.REPL_STOP, () => {
		process.stdin.addListener('keypress', keypressListener);
	});
}

/**
 * @param {ChildProcess} child - the child process instance running the test
 * @param {Function} onExit - callback function to call when the process finishes
 * @param {WritableStream} logStream - the output stream of the child process.
 * @param {string} sessionType - suitest test execution mode
 */
function attachIO(child, onExit, logStream, sessionType) {
	const [childIn, childOut, childErr] = child.stdio;
	const logIo = chunk => logOutput(child, chunk, logStream);

	registerProcess(child);

	// in interactive mode pipe stdin so that console is not confused by REPL
	if (sessionType === INTERACTIVE) {
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
 * @param {string} sessionType - suitest execution mode (interactive|automated)
 * @param {number} ipcPort
 * @returns {Promise<any>}
 */
async function runTestOnDevice(cmdArgv, ownArgv, device, sessionType, ipcPort) {
	const {logDir} = ownArgv;
	const options = getChildOptions(device.deviceId, ipcPort);
	const child = await launchChild(cmdArgv, ownArgv, options, sessionType);
	const logStream = getDeviceLogStream(device, cmdArgv, new Date(), logDir);

	return new Promise(resolve => {
		logStream && logStream.write(texts.fileLogSummary(
			cmdArgv.join(' '),
			ownArgv.orgId,
			ownArgv.appConfigId,
			sessionType === AUTOMATED ? ownArgv.testPackId : '',
			new Date()
		));

		const onExit = (exitCode, signal) => {
			logStream && logStream.write(texts.fileLogCompleted(
				exitCode, signal
			));
			resolve(exitCode, signal);
		};

		attachIO(child, onExit, logStream, sessionType);
	});
}

/**
 * Prepares environment for the child process.
 * @param {string} deviceId - id of the device
 * @param {number} port - ipc port
 * @returns {{shell: true, env: Object}}
 */
function getChildOptions(deviceId, port) {
	return {
		shell: true,
		env: {
			...process.env,
			[envVars.SUITEST_CHILD_PROCESS]: `${deviceId}|${port}`,
			FORCE_COLOR: true,
			NODE_NO_READLINE: 1, // enable repl in advanced consoles
		},
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
		throw new SuitestError(t['errorType.testPackNoDevices'](), SuitestError.INVALID_INPUT);
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
 * @param {number} ipcPort - ipc port number
 * @returns {Promise<*>}
 */
function runAllDevices(cmdArgv, ownArgv, devices, ipcPort) {
	const tests = devices.map(device => () => runTestOnDevice(
		cmdArgv, ownArgv, device, AUTOMATED, ipcPort
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
 * @param {boolean} withError
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
	validateInput,
	prepareTestPackExecution,
	runTestOnDevice,
	runAllDevices,
	finishInteractive,
	getVersion,
	getDebugPort,
	addLauncherIpcListeners,
	throwDebugInAutomatedError,
};
