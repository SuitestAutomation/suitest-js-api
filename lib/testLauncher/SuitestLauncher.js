const {
	handleLauncherError,
	validateInput,
	runAllDevices,
	getVersion,
	isDebugMode,
	addLauncherIpcListeners,
	throwDebugForManyDevicesError,
	increaseMaxListeners,
} = require('../utils/testLauncherHelper');
const {TEST_COMMAND, TOKEN} = require('../constants/modes');
const sessionConstants = require('../constants/session');
const {getDevicesDetails} = require('../utils/getDeviceInfo');
const {closeSessionUnchained} = require('../commands/closeSession');
const {captureException} = require('../utils/sentry/Raven');
const {
	launcherGreeting,
} = require('../texts');
const {version} = require('../../package.json');
const ipcServer = require('./ipc/server');
const suitest = require('../../index');

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
		suitest.logger.intro(launcherGreeting, version, TOKEN);
		validateInput(TOKEN.toUpperCase(), this.ownArgv);

		try {
			const appConfigIdAndDeviceIdPresented = this.ownArgv.appConfigId && this.ownArgv.deviceId;

			if (isDebugMode(this.ownArgv) && !appConfigIdAndDeviceIdPresented) {
				// should be allowed for single device only
				throwDebugForManyDevicesError();
			}

			// TODO: add validation for availability "presets" or ("deviceId" and "appConfigId") here or in jsonSchemas
			const devices = appConfigIdAndDeviceIdPresented
				? [{
					device: this.ownArgv.deviceId,
					config: this.ownArgv.appConfigId,
				}]
				: Object.keys(this.ownArgv.presets).map((key) => {
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

			try {
				const ipcPort = await ipcServer.start({
					...this.ownArgv,
					launcherVersion: version,
					sessionToken: Buffer.from(`${this.ownArgv.tokenId}:${this.ownArgv.tokenPassword}`).toString('base64'),
					isDebugMode: isDebugMode(this.ownArgv),
					// should be allowed for single device only
					replAllowed: appConfigIdAndDeviceIdPresented,
					sessionType: TOKEN,
				});

				addLauncherIpcListeners();
				// increase stdout max listeners based on number of child processes to avoid node warning
				increaseMaxListeners(process.stdout, devices.length, this.ownArgv.concurrency);

				await runAllDevices(
					this.restArgs,
					this.ownArgv,
					devicesWithDetails,
					ipcPort,
				);
			} finally {
				await closeSessionUnchained(suitest);
			}
		} catch (error) {
			await captureException(error);
			handleLauncherError(error);
		}
	}
}

module.exports = SuitestLauncher;
