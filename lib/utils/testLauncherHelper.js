const ramda = require('ramda');
const path = require('path');
const moment = require('moment');
const cp = require('child_process');
const keypress = require('keypress');

const validation = require('../validation');
const launcherHelper = require('./launcherLoggerHelper');
const {snippets: log} = require('../testLauncher/launcherLogger');
const texts = require('../texts');

const Queue = require('./Queue');
const {registerProcess} = require('../testLauncher/processReaper');
const envVars = require('../constants/environment');

const {version} = require('../../package.json');
const {stripAnsiChars} = require('./stringUtils');

const {TEST_COMMAND} = require('../constants/modes');

const {fetchLatestSuitestVersion, warnNewVersionAvailable} = require('./packageMetadataHelper');

const ipcServer = require('../testLauncher/ipc/server');
const messageId = require('../constants/ipcMessageId');
const suitest = require('../../index');
const {logger} = suitest;

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
 * Validate test launcher's args based on session type
 * @param {'TEST_COMMAND'|'TOKEN'} type session type
 * @param {Object} args test launcher arguments
 */
function validateInput(type, args) {
	try {
		const msg = type === TEST_COMMAND
			? texts['errorType.suitestTestCommand']
			: texts['errorType.suitestCommand'](type.toLowerCase());

		validation.validate(
			validation.validators[`TEST_LAUNCHER_${type}`],
			args, msg,
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
 * If logDir specified creates and return writeStream
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
 * Check if debug argument presents and return debug option
 * @param {Object} ownArgw - implicitly derived launched parameters
 * @returns {string | boolean}
 */
function getDebugOption({inspectBrk, inspect}) {
	const debuggerType = ramda.toPairs(ramda.pickBy(v => ramda.is(Number, v) || ['true', true].includes(v), {
		'--inspect-brk': inspectBrk,
		'--inspect': inspect,
	}));

	return debuggerType[0]
		? `${debuggerType[0][0]}${ramda.is(Number, debuggerType[0][1]) ? '=' + debuggerType[0][1] : ''}`
		: false;
}

function isDebugMode({inspectBrk, inspect}) {
	const hasDebuggerArgument = [inspectBrk, inspect].find(v => ramda.is(Number, v) || ['true', true].includes(v));
	const hasDebuggerExecArgv = process.execArgv.find(a => a.includes('--inspect'));

	return Boolean(hasDebuggerArgument || hasDebuggerExecArgv);
}

/**
 * Throw error and exit process when user wants to run debugging with multiply devices
 */
function throwDebugForManyDevicesError() {
	logger.error(texts['tl.inspectOnlyForSingleDevice']());
	process.exit(1);
}

/**
 * Creates new process instance for the test execution on a device.
 * @param {Array} cmdArgv - user test command and it's parameters
 * @param {Object} ownArgv - implicitly derived launcher parameters
 * @param {Object} options - child process environment options
 * @param {Boolean} singleDeviceOnly - overall execution will be ran for single device
 * @returns {ChildProcess} - spawned child process
 */
async function launchChild(cmdArgv, ownArgv, options, singleDeviceOnly) {
	const [command, ...args] = cmdArgv;
	const debugOption = getDebugOption(ownArgv);

	if (debugOption) {
		args.unshift(debugOption);
	}

	if (singleDeviceOnly) {
		options.stdio = 'pipe';
	}

	return cp.spawn(
		command,
		args,
		options,
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
 * This function manually enables ctrl+c together with the keypress module
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
 * @param {Boolean} singleDeviceOnly - overall execution will be ran for single device
 */
function attachIO(child, onExit, logStream, singleDeviceOnly) {
	const [childIn, childOut, childErr] = child.stdio;
	const logIo = chunk => logOutput(child, chunk, logStream);

	registerProcess(child);

	// for single device execution pipe stdin so that console is not confused by REPL
	if (singleDeviceOnly) {
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
 * @param {Boolean} singleDeviceOnly - overall execution will be ran for single device
 * @param {number} ipcPort
 * @returns {Promise<any>}
 */
async function runTestOnDevice(cmdArgv, ownArgv, device, singleDeviceOnly, ipcPort) {
	const {logDir} = ownArgv;
	const options = getChildOptions(device, ipcPort);
	const child = await launchChild(cmdArgv, ownArgv, options, singleDeviceOnly);
	const logStream = getDeviceLogStream(device, cmdArgv, new Date(), logDir);

	return new Promise(resolve => {
		logStream && logStream.write(texts.fileLogSummary(
			cmdArgv.join(' '),
			ownArgv.orgId,
			ownArgv.appConfigId,
			new Date(),
		));

		const onExit = (exitCode, signal) => {
			logStream && logStream.write(texts.fileLogCompleted(
				exitCode, signal,
			));
			resolve(exitCode, signal);
		};

		attachIO(child, onExit, logStream, singleDeviceOnly);
	});
}

/**
 * Prepares environment for the child process.
 *
 * @param {string} device - device object. deviceId and config should be provided.
 * @param {number} port - ipc port
 * @returns {{shell: true, env: Object}}
 */
function getChildOptions(device, port) {
	return {
		shell: true,
		env: {
			...process.env,
			[envVars.SUITEST_CHILD_PROCESS]: `${device.deviceId}|${device.config}|${port}`,
			[envVars.SUITEST_PRESET_NAME]: device.presetName,
			FORCE_COLOR: true,
			NODE_NO_READLINE: 1, // enable repl in advanced consoles
		},
	};
}

/**
 * Runs all devices by spawning subprocesses
 *
 * @param {Array} cmdArgv - user command and it's arguments
 * @param {Object} ownArgv - implicitly derived parameters
 * @param {Array} devices - array with items containing full device information
 * @param {number} ipcPort - ipc port number
 * @returns {Promise<boolean>} - finished with errors or not.
 */
function runAllDevices(cmdArgv, ownArgv, devices, ipcPort) {
	const tests = devices.map(device => () => runTestOnDevice(
		cmdArgv,
		ownArgv,
		device,
		devices.length === 1,
		ipcPort,
	));

	const queue = new Queue(ownArgv.concurrency, tests);

	logger.intro(
		texts.launcherSummary,
		cmdArgv.join(' '),
		ownArgv.logDir,
		...devices.map(device => device.displayName),
	);

	return queue.start().then(result => {
		const failedDevices = result.filter(
			res => {
				const code = res.result.code || res.result;

				return res.result.error || code !== 0;
			},
		);

		log.final(failedDevices.length, result.length - failedDevices.length);
		warnNewVersionAvailable(logger, version, suitestVersion);

		return failedDevices.length !== 0;
	});
}

/**
 * Get's the version of the latest published suitest-js-api package
 * @returns {Promise<String>}
 */
async function getVersion() {
	suitestVersion = await fetchLatestSuitestVersion();

	return suitestVersion;
}

/**
 * Increase event emitter max allowed listeners count by 2 per child thread
 * @param {EventEmitter} emitter
 * @param {number} deviceCount
 * @param {number} concurrency
 * @modifies emitter
 */
function increaseMaxListeners(emitter, deviceCount, concurrency= 0) {
	const threadCount = concurrency === 0 ? deviceCount : Math.min(concurrency, deviceCount);

	emitter.setMaxListeners(emitter.getMaxListeners() + threadCount * 2);
}

module.exports = {
	handleLauncherError,
	handleChildResult,
	validateInput,
	runTestOnDevice,
	runAllDevices,
	getVersion,
	isDebugMode,
	getDebugOption,
	addLauncherIpcListeners,
	throwDebugForManyDevicesError,
	increaseMaxListeners,
};
