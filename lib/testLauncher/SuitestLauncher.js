const {
	handleLauncherError,
	validateInput,
	runAllDevices,
	getVersion,
	isDebugMode,
	addLauncherIpcListeners,
	throwDebugForManyDevicesError,
	increaseMaxListeners,
	handleChildResult,
} = require('../utils/testLauncherHelper');
const {TEST_COMMAND, TOKEN} = require('../constants/modes');
const sessionConstants = require('../constants/session');
const {getDevicesDetails} = require('../utils/getDeviceInfo');
const {closeSessionUnchained} = require('../commands/closeSession');
const {captureException} = require('../utils/sentry/Raven');
const t = require('../texts');
const {version} = require('../../package.json');
const ipcServer = require('./ipc/server');
const suitest = require('../../index');
const SuitestError = require('../utils/SuitestError');

function exitProcessWithError(message) {
	suitest.logger.error(message);
	process.exit(1);
}

class SuitestLauncher {
	constructor(ownArgv = {}, restArgs = []) {
		this.ownArgv = ownArgv;
		this.restArgs = restArgs;
		validateInput(TEST_COMMAND, this.restArgs);
		getVersion().then(version => {
			this.latestSuitestVersion = version;
		});
	}

	async runTokenSession() {
		suitest.logger.intro(t.launcherGreeting, version);
		validateInput(TOKEN.toUpperCase(), this.ownArgv);
		const appConfigIdAndDeviceIdPresented = this.ownArgv.appConfigId && this.ownArgv.deviceId;
		const presetArrayDefined = this.ownArgv.preset && this.ownArgv.preset.length > 0;

		if (!appConfigIdAndDeviceIdPresented && !presetArrayDefined) {
			exitProcessWithError(t['errorType.specifyRunningDevices']());
		}

		// check that presets are exists only if appConfigId and deviceId not specified via cli
		if (!appConfigIdAndDeviceIdPresented && presetArrayDefined) {
			const definedPresets = Object.keys(this.ownArgv.presets || {});
			const notFoundPresets = this.ownArgv.preset.filter(p => !definedPresets.includes(p));

			if (notFoundPresets.length > 0) {
				exitProcessWithError(t['errorType.notFoundPresets'](notFoundPresets));
			}
		}

		try {
			const devices = appConfigIdAndDeviceIdPresented
				? [{
					device: this.ownArgv.deviceId,
					config: this.ownArgv.appConfigId,
				}]
				: this.ownArgv.preset.map((key) => {
					const preset = this.ownArgv.presets[key];

					return {
						device: typeof preset.device === 'string' ? preset.device : preset.device.deviceId,
						config: typeof preset.config === 'string' ? preset.config : preset.config.configId,
						presetName: key,
					};
				});

			await suitest.authContext.setContext(
				sessionConstants.TOKEN,
				this.ownArgv.tokenId,
				this.ownArgv.tokenPassword,
			);

			const devicesWithDetails = await getDevicesDetails(suitest, devices);
			const runsOnSingleDevice = devicesWithDetails.length === 1;

			if (devicesWithDetails.length === 0) {
				throw new SuitestError(t['errorType.noDevices']());
			}

			// should be allowed for single device only
			if (isDebugMode(this.ownArgv) && !runsOnSingleDevice) {
				throwDebugForManyDevicesError();
			}

			let finishedWithErrors = false;

			try {
				const ipcPort = await ipcServer.start({
					...this.ownArgv,
					launcherVersion: version,
					isDebugMode: isDebugMode(this.ownArgv),
					runsOnSingleDevice,
					sessionType: TOKEN,
				});

				addLauncherIpcListeners();
				// increase stdout max listeners based on number of child processes to avoid node warning
				increaseMaxListeners(process.stdout, devices.length, this.ownArgv.concurrency);

				finishedWithErrors = await runAllDevices(
					this.restArgs,
					this.ownArgv,
					devicesWithDetails,
					ipcPort,
				);
			} finally {
				await closeSessionUnchained(suitest);
				handleChildResult(finishedWithErrors);
			}
		} catch (error) {
			await captureException(error);
			handleLauncherError(error);
		}
	}
}

module.exports = SuitestLauncher;
