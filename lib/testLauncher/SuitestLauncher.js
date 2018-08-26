const cp = require('child_process');
const {EOL} = require('os');
const {path, pluck} = require('ramda');
const {normalize} = require('path');
const Queue = require('../utils/Queue');
const {
	handleChildResult,
	handleLauncherError,
	followChildProcess,
	validateInput,
	writeLogs,
} = require('../utils/testLauncherHelper');
const {
	getDevicesDetails,
	getDeviceName,
} = require('../utils/getDeviceInfo');
const envVars = require('../constants/enviroment');
const {openSessionUnchained} = require('../commands/openSession');
const {closeSessionUnchained} = require('../commands/closeSession');
const {startTestPackUnchained} = require('../commands/startTestPack');
const {snippets: log} = require('./launcherLogger');
const logger = require('../utils/logger');
const {stripAnsiChars} = require('../utils/stringUtils');
const {captureException} = require('../utils/sentry/Raven');
const texts = require('../texts');
const {registerProcess} = require('./processReaper');
const {config} = require('../../config');
const {version} = require('../../package.json');
const {fetchLatestSuitestVersion, warnNewVersionAvailable} = require('../utils/packageMetadataHelper');

class SuitestLauncher {
	constructor(ownArgv = {}, restArgs = []) {
		this.ownArgv = ownArgv;
		this.restArgs = restArgs;
		this.latestSuitestVersion = '';

		fetchLatestSuitestVersion().then(version => this.latestSuitestVersion = version);
		log.greeting();
	}

	async runAutomatedSession() {
		log.createTestPack();
		validateInput('AUTOMATED', this.ownArgv);
		try {
			const {tokenKey, tokenPassword, testPackId, logDir, inspect, inspectBrk} = this.ownArgv;

			if (inspect || inspectBrk) {
				logger.error(texts['tl.inspectOnlyForInteractiveMode']());
				process.exit(1);
			}

			const queue = new Queue(this.ownArgv.concurrency);
			const accessToken = await startTestPackUnchained({
				accessTokenKey: tokenKey,
				accessTokenPassword: tokenPassword,
				testPackId,
			});
			const devices = pluck('deviceId', path(['testPack', 'devices'], accessToken));
			const devicesWithDetails = await getDevicesDetails(devices);
			const deviceCount = devicesWithDetails.length;

			log.runOnDevices(deviceCount);
			if (!deviceCount) {
				await closeSessionUnchained();

				return process.exit(1);
			}

			try {
				const devicesLogs = {};

				devicesWithDetails.forEach(device => {
					queue.push(() => new Promise(res => {
						const options = {
							shell: true,
							env: {
								...process.env,
								// Use string value to avoid confusion with type casting
								// Over several NodeJS versions
								[envVars.SUITEST_CLOSE_SESSION]: 'no',
								[envVars.SUITEST_SESSION_TYPE]: 'automated',
								[envVars.SUITEST_SESSION_TOKEN]: accessToken.deviceAccessToken,
								[envVars.SUITEST_DEVICE_ID]: device.deviceId,
								[envVars.SUITEST_CONFIG_LOG_LEVEL]: config.logLevel,
								[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS]: config.disallowCrashReports,
								[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR]: config.continueOnFatalError,
								[envVars.SUITEST_LAUNCHER_VERSION]: version,
								FORCE_COLOR: true,
							},
						};

						const writeStream = writeLogs(device.deviceId, this.restArgs, logDir, getDeviceName(device));

						devicesLogs[device.deviceId] = [];

						const child = cp.spawn(this.restArgs[0], this.restArgs.slice(1), options)
							.on('close', code => res({
								...device,
								code,
							}));

						registerProcess(child);

						followChildProcess(child, msg => {
							writeStream.write && writeStream.write(EOL + stripAnsiChars(msg));
							devicesLogs[device.deviceId].push({
								msg,
								device,
							});
						});
					}));
				});

				await new Promise(resolve => queue.start().then(result => {
					// log all devices logs
					const device = dId => devicesWithDetails.find(d => d.deviceId === dId) || {};
					const failedDevices = result.filter(res => res.result.error || res.result.code !== 0);

					Object.keys(devicesLogs)
						.forEach(dId => log.deviceLines(devicesLogs[dId], dId, getDeviceName(device(dId))));

					// log final result
					log.finalAutomated(failedDevices.length, result.length - failedDevices.length);
					warnNewVersionAvailable(version, this.latestSuitestVersion);
					handleChildResult(failedDevices.length - result.length >= 0);
					resolve();
				}));
			} finally {
				await closeSessionUnchained();
			}
		} catch (error) {
			await captureException(error);
			handleLauncherError(error);
		}
	}

	async runInteractiveSession() {
		validateInput('INTERACTIVE', this.ownArgv);

		try {
			const {username, password, orgId, deviceId, appConfigId, inspect, inspectBrk, logDir, repl} = this.ownArgv;
			const {deviceAccessToken} = await openSessionUnchained({
				username,
				password,
				orgId,
			});
			const [deviceDetails] = await getDevicesDetails([deviceId]);
			const deviceName = deviceDetails && getDeviceName(deviceDetails) || '';
			const isDebugMode = inspectBrk || inspect;

			try {
				const childProcessCode = await new Promise(resolve => {
					const options = {
						shell: true,
						env: {
							...process.env,
							// Use string value to avoid confusion with type casting
							// Over several NodeJS versions
							[envVars.SUITEST_CLOSE_SESSION]: 'no',
							[envVars.SUITEST_SESSION_TYPE]: 'interactive',
							[envVars.SUITEST_SESSION_TOKEN]: deviceAccessToken,
							[envVars.SUITEST_DEVICE_ID]: deviceId,
							[envVars.SUITEST_APP_CONFIG_ID]: appConfigId,
							[envVars.SUITEST_DEBUG_MODE]: isDebugMode ? 'yes' : 'no',
							[envVars.SUITEST_CONFIG_LOG_LEVEL]: config.logLevel,
							[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS]: config.disallowCrashReports,
							[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR]: config.continueOnFatalError,
							[envVars.SUITEST_LAUNCHER_VERSION]: version,
							[envVars.SUITEST_REPL_MODE]: repl,
							FORCE_COLOR: true,
						},
					};

					if (isDebugMode || repl) {
						const execArgv = [];

						options.env.NODE_NO_READLINE = 1; // enable repl in advanced consoles

						if (isDebugMode) {
							execArgv.push(`--inspect${inspectBrk ? '-brk' : ''}=${inspectBrk || inspect}`);
						}
						if (repl) {
							execArgv.push('--experimental-repl-await');
						}

						const child = cp.fork(this.restArgs[0], this.restArgs.slice(1), {
							...options,
							execArgv,
							cwd: normalize(process.cwd()),
							execPath: normalize(process.execPath),
						}).on('close', resolve);

						registerProcess(child);
					} else {
						const writeStream = writeLogs(deviceId, this.restArgs, logDir, deviceName);
						const child = cp.spawn(this.restArgs[0], this.restArgs.slice(1), options).on('close', resolve);

						registerProcess(child);

						followChildProcess(child, msg => {
							writeStream.write && writeStream.write(EOL + stripAnsiChars(msg));
							logger.log(msg, deviceId);
						});
					}
				});
				const finishedWithErrors = childProcessCode !== 0;

				// log final result
				log.finalInteractive(finishedWithErrors);
				warnNewVersionAvailable(version, this.latestSuitestVersion);
				handleChildResult(finishedWithErrors);
			} finally {
				await closeSessionUnchained();
			}
		} catch (error) {
			await captureException(error);
			handleLauncherError(error);
		}
	}
}

module.exports = SuitestLauncher;
