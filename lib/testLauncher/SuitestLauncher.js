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
const {snippets: log, launcherLogger} = require('./launcherLogger');
const ansiRegex = require('ansi-regex');
const {authContext} = require('../context');
const sessionConstants = require('../constants/session');
const {captureException} = require('../utils/sentry/Raven');
const texts = require('../texts');

class SuitestLauncher {
	constructor(ownArgv = {}, restArgs = []) {
		this.ownArgv = ownArgv;
		this.restArgs = restArgs;

		log.greeting();
	}

	async runAutomatedSession() {
		log.createTestPack();
		validateInput('AUTOMATED', this.ownArgv);
		try {
			const {tokenKey, tokenPassword, testPackId, logDir, inspect, inspectBrk} = this.ownArgv;

			if (inspect || inspectBrk) {
				launcherLogger._err(texts['tl.inspectOnlyForInteractiveMode']());
				process.exit(1);
			}
			const queue = new Queue(this.ownArgv.concurrency);
			const accessToken = await startTestPackUnchained({
				accessTokenKey: tokenKey,
				accessTokenPassword: tokenPassword,
				testPackId,
			});

			const devices = pluck('deviceId', path(['testPack', 'devices'], accessToken));
			// todo: remove changing context when '/devices' will be available with deviceAccessToken
			authContext.setContext(
				sessionConstants.ACCESS_TOKEN,
				tokenKey,
				tokenPassword
			);
			const devicesWithDetails = await getDevicesDetails(devices);

			authContext.setContext(sessionConstants.AUTOMATED, accessToken.deviceAccessToken);
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
								[envVars.SUITEST_LAUNCHER_PROCESS]: true,
								[envVars.SUITEST_SESSION_TYPE]: 'automated',
								[envVars.SUITEST_SESSION_TOKEN]: accessToken.deviceAccessToken,
								[envVars.SUITEST_DEVICE_ID]: device.deviceId,
								[envVars.SUITEST_CONFIG_LOG_LEVEL]: this.ownArgv.logLevel,
								[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS]: this.ownArgv.disallowCrashReports,
								[envVars.SUITEST_CONFIG_DIE_ON_FATAL_ERROR]: this.ownArgv.dieOnFatalError,
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

						followChildProcess(child, (msg, type) => {
							writeStream.write && writeStream.write(EOL + msg.replace(ansiRegex(), ''));
							devicesLogs[device.deviceId].push({
								msg,
								type,
								device,
							});
						});
					}));
				});

				await new Promise(resolve => queue.start().then(result => {
					// log all devices logs
					const device = dId => devicesWithDetails.find(d => d.deviceId === dId) || {};
					const failedDevices = result.filter(res => res.result.error || res.result.code !== 0);

					Object.keys(devicesLogs).forEach(dId => log.deviceLines(devicesLogs[dId], dId, getDeviceName(device(dId))));
					// log final result
					log.finalAutomated(failedDevices.length, result.length - failedDevices.length);
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

			try {
				const childProcessCode = await new Promise(resolve => {
					const options = {
						shell: true,
						env: {
							...process.env,
							[envVars.SUITEST_LAUNCHER_PROCESS]: true,
							[envVars.SUITEST_SESSION_TYPE]: 'interactive',
							[envVars.SUITEST_SESSION_TOKEN]: deviceAccessToken,
							[envVars.SUITEST_DEVICE_ID]: deviceId,
							[envVars.SUITEST_APP_CONFIG_ID]: appConfigId,
							[envVars.SUITEST_CONFIG_LOG_LEVEL]: this.ownArgv.logLevel,
							[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS]: this.ownArgv.disallowCrashReports,
							[envVars.SUITEST_CONFIG_DIE_ON_FATAL_ERROR]: this.ownArgv.dieOnFatalError,
							FORCE_COLOR: true,
						},
					};

					if (inspectBrk || inspect) {
						this.restArgs.shift();
						cp.fork(this.restArgs[0], this.restArgs.slice(1), {
							...options,
							execArgv: [
								`--inspect${inspectBrk ? '-brk' : ''}=${inspectBrk || inspect}`,
							],
							cwd: normalize(process.cwd()),
							execPath: normalize(process.execPath),
						}).on('close', resolve);
					} else {
						const writeStream = writeLogs(deviceId, this.restArgs, logDir);
						const child = cp.spawn(this.restArgs[0], this.restArgs.slice(1), options).on('close', resolve);

						followChildProcess(child, (msg, type) => {
							writeStream.write && writeStream.write(EOL + msg.replace(ansiRegex(), ''));
							launcherLogger[type](msg, deviceId);
						});
					}
				});
				const finishedWithErrors = childProcessCode !== 0;

				// log final result
				log.finalInteractive(finishedWithErrors);
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
