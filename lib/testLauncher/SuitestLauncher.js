const cp = require('child_process');
const {EOL} = require('os');
const Queue = require('../utils/Queue');
const {
	handleChildResult,
	handleLauncherError,
	followChildProcess,
	validateInput,
	writeLogs,
} = require('../utils/testLauncherHelper');
const envVars = require('../constants/enviroment');
const suitest = require('../../index.js');
const {snippets: log, launcherLogger} = require('./launcherLogger');
const {override} = require('../../config');

class SuitestLauncher {
	constructor(ownArgv = {}, restArgs = []) {
		this.ownArgv = ownArgv;
		this.restArgs = restArgs;

		override(this.ownArgv); // override lib config with user settings
		log.greeting();
	}

	async runAutomatedSession() {
		log.createTestPack();
		validateInput('AUTOMATED', this.ownArgv);
		try {
			const {tokenKey, tokenPassword, testPackId, logDir} = this.ownArgv;
			const queue = new Queue(this.ownArgv.concurrency);
			const accessToken = await suitest.startTestPack({
				accessTokenKey: tokenKey,
				accessTokenPassword: tokenPassword,
				testPackId,
			});
			const deviceCount = accessToken.testPack.devices.length;

			log.runOnDevices(deviceCount);
			if (!deviceCount) {
				return process.exit(1);
			}

			const devicesLogs = {};

			accessToken.testPack.devices.forEach(device => {
				queue.push(() => new Promise(res => {
					const options = {
						shell: true,
						env: {
							...process.env,
							[envVars.SUITEST_LAUNCHER_PROCESS]: true,
							[envVars.SUITEST_SESSION_TYPE]: 'automated',
							[envVars.SUITEST_SESSION_TOKEN]: accessToken.deviceAccessToken,
							[envVars.SUITEST_DEVICE_ID]: device.deviceId,
						},
					};

					const writeStream = writeLogs(device.deviceId, this.restArgs, logDir);

					devicesLogs[device.deviceId] = [];

					const child = cp.spawn(this.restArgs[0], this.restArgs.slice(1), options)
						.on('close', code => res({
							...device,
							code,
						}));

					followChildProcess(child, (msg, type) => {
						writeStream.write && writeStream.write(EOL + msg);
						devicesLogs[device.deviceId].push({
							msg,
							type,
						});
					});
				}));
			});

			await new Promise(resolve => queue.start().then(result => {
				// log all devices logs
				Object.keys(devicesLogs).forEach(dId => log.deviceLines(devicesLogs[dId], dId));

				const failedDevices = result.filter(res => res.result.error || res.result.code !== 0);

				// log final result
				log.finalAutomated(failedDevices.length, result.length - failedDevices.length);
				handleChildResult(failedDevices.length - result.length >= 0);
				resolve();
			}));
		} catch (error) {
			handleLauncherError(error);
		}
	}

	async runInteractiveSession() {
		validateInput('INTERACTIVE', this.ownArgv);

		try {
			const {username, password, orgId, deviceId, appConfigId, inspect, inspectBrk, logDir} = this.ownArgv;
			const {deviceAccessToken} = await suitest.openSession({
				username,
				password,
				orgId,
			});
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
					},
				};

				if (inspectBrk || inspect) {
					if (this.restArgs[0] === process.execPath) {
						this.restArgs.shift();
					}
					cp.fork(this.restArgs[0], this.restArgs.slice(1), {
						...options,
						execArgv: [
							`--inspect${inspectBrk ? '-brk' : ''}=${inspectBrk || inspect}`,
						],
					}).on('close', resolve);
				} else {
					const writeStream = writeLogs(deviceId, this.restArgs, logDir);
					const child = cp.spawn(this.restArgs[0], this.restArgs.slice(1), options).on('close', resolve);

					followChildProcess(child, (msg, type) => {
						writeStream.write && writeStream.write(EOL + msg);
						launcherLogger[type](msg);
					});
				}
			});
			const finishedWithErrors = childProcessCode !== 0;

			// log final result
			log.finalInteractive(finishedWithErrors);
			handleChildResult(finishedWithErrors);
			suitest.closeSession();
		} catch (error) {
			handleLauncherError(error);
		}
	}
}

module.exports = SuitestLauncher;
