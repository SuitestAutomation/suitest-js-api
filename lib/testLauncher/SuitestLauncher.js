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
const {getDevicesDetails} = require('../utils/getDeviceInfo');
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
				const startTime = new Date();

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

						const writeStream = writeLogs(device, this.restArgs, startTime, logDir, 'automated');
						const child = cp.spawn(this.restArgs[0], this.restArgs.slice(1), options)
							.on('close', code => res({
								...device,
								code,
							}));

						registerProcess(child);

						followChildProcess(child, msg => {
							writeStream.write && writeStream.write(EOL + stripAnsiChars(msg));
							logger.log(msg, device);
						});
					}));
				});

				await new Promise(resolve => queue.start().then(result => {
					// log final result
					const failedDevices = result.filter(res => res.result.error || res.result.code !== 0);

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
			const {username, password, orgId, deviceId, appConfigId, inspect, inspectBrk, logDir} = this.ownArgv;
			const {deviceAccessToken} = await openSessionUnchained({
				username,
				password,
				orgId,
			});
			const [deviceDetails] = await getDevicesDetails([deviceId]);
			const isDebugMode = inspectBrk || inspect;
			const startTime = new Date();

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
							FORCE_COLOR: true,
						},
					};

					if (isDebugMode) {
						const child = cp.fork(this.restArgs[0], this.restArgs.slice(1), {
							...options,
							execArgv: [
								`--inspect${inspectBrk ? '-brk' : ''}=${inspectBrk || inspect}`,
							],
							cwd: normalize(process.cwd()),
							execPath: normalize(process.execPath),
						}).on('close', resolve);

						registerProcess(child);
					} else {
						const writeStream = writeLogs(deviceDetails, this.restArgs, startTime, logDir, 'interactive');
						const child = cp.spawn(this.restArgs[0], this.restArgs.slice(1), options).on('close', resolve);

						registerProcess(child);

						followChildProcess(child, msg => {
							writeStream.write && writeStream.write(EOL + stripAnsiChars(msg));
							logger.log(msg, deviceDetails);
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
