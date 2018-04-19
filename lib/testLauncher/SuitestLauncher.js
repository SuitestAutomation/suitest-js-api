const spawn = require('child_process').spawn;

const Queue = require('../utils/Queue');
const {handleChildResult, handleLauncherError, followChildProccess} = require('../utils/testLauncherHelper');
const envVars = require('../constants/enviroment');
const suitest = require('../../index.js');
const {validate, validators} = require('../validataion');
const {snippets: log} = require('./launcherLogger');

class SuitestLauncher {
	constructor(ownArgv = {}, restArgs = []) {
		this.ownArgv = ownArgv;
		this.restArgs = restArgs;

		log.greeting();
	}

	async runAautomatedSession() {
		log.createTestPack();

		try {
			validate(
				validators.TEST_LAUNCHER_AUTOMATED,
				this.ownArgv, 'provided for \'suitest automated\' command. It'
			);
		} catch (error) {
			log.argsValidationError(error);

			return process.exit(1);
		}

		try {
			const {tokenKey, tokenPassword, testPackId} = this.ownArgv;
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

					log.startOnDevice(device.deviceId, this.restArgs.join(' '));
					devicesLogs[device.deviceId] = [];

					const child = spawn(this.restArgs[0], this.restArgs.slice(1), options)
						.on('close', code => res({
							...device,
							code,
						}));

					followChildProccess(child, line => {
						devicesLogs[device.deviceId].push(line);
					});
				}));
			});

			await new Promise(resolve => queue.start().then(async(result) => {
				// log all devices logs
				Object.keys(devicesLogs).forEach(dId => log.deviceLines(devicesLogs[dId], dId));

				const failedDevices = result.filter(res => res.result.error || res.result.code !== 0);

				// log final result
				log.finalAutomated(failedDevices.length, result.length - failedDevices.length);
				handleChildResult(failedDevices.length - result.length >= 0);
				suitest.closeSession();
				resolve();
			}));
		} catch (error) {
			handleLauncherError(error);
		}
	}

	async runInteractiveSession() {
		try {
			validate(
				validators.TEST_LAUNCHER_INTERACTIVE,
				this.ownArgv, 'provided for \'suitest interactive\' command. It'
			);
		} catch (error) {
			log.argsValidationError(error);

			return process.exit(1);
		}

		try {
			const {username, password, orgId, deviceId, appConfigId} = this.ownArgv;
			const {deviceAccessToken} = await suitest.openSession({
				username,
				password,
				orgId,
			});
			const deviceLogs = [];
			const childProcessCode = await new Promise(resolve => {
				const options = {
					shell: true,
					env: {
						...process.env,
						// [envVars.SUITEST_LAUNCHER_PROCESS]: true,
						[envVars.SUITEST_SESSION_TYPE]: 'interactive',
						[envVars.SUITEST_SESSION_TOKEN]: deviceAccessToken,
						[envVars.SUITEST_DEVICE_ID]: deviceId,
						[envVars.SUITEST_APP_CONFIG_ID]: appConfigId,
					},
				};

				log.startOnDevice(deviceId, this.restArgs.join(' '));
				const child = spawn(this.restArgs[0], this.restArgs.slice(1), options).on('close', resolve);

				followChildProccess(child, line => {
					deviceLogs.push(line);
				});
			});
			const finishedWithErrors = childProcessCode !== 0;

			// log all devices logs
			log.deviceLines(deviceLogs, deviceId);
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
