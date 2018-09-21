const {
	finishInteractive,
	handleLauncherError,
	validateInput,
	runAllDevices,
	prepareTestPackExecution,
	runTestOnDevice,
	getVersion,
	AUTOMATED,
	INTERACTIVE,
} = require('../utils/testLauncherHelper');
const {getDevicesDetails} = require('../utils/getDeviceInfo');
const {openSessionUnchained} = require('../commands/openSession');
const {closeSessionUnchained} = require('../commands/closeSession');
const {captureException} = require('../utils/sentry/Raven');
const {intro, colors} = require('../utils/logger');
const {launcherGreeting, launcherSummaryInteractive} = require('../texts');
const {version} = require('../../package.json');

class SuitestLauncher {
	constructor(ownArgv = {}, restArgs = []) {
		this.ownArgv = ownArgv;
		this.restArgs = restArgs;
		getVersion().then(version => {
			this.latestSuitestVersion = version;
		});
	}

	async runAutomatedSession() {
		intro(launcherGreeting, version, AUTOMATED);
		validateInput(AUTOMATED.toUpperCase(), this.ownArgv);

		try {
			const {devices, deviceAccessToken} = await prepareTestPackExecution(this.ownArgv);
			const devicesWithDetails = await getDevicesDetails(devices);

			try {
				await runAllDevices(
					this.restArgs,
					this.ownArgv,
					devicesWithDetails,
					deviceAccessToken,
				);
			} finally {
				await closeSessionUnchained();
			}
		} catch (error) {
			await captureException(error);
			handleLauncherError(error);
		}
	}

	async runInteractiveSession() {
		intro(launcherGreeting, version, INTERACTIVE);
		validateInput(INTERACTIVE.toUpperCase(), this.ownArgv);

		try {
			const {username, password, orgId, deviceId} = this.ownArgv;
			const {deviceAccessToken} = await openSessionUnchained({
				username,
				password,
				orgId,
			});
			const [deviceDetails] = await getDevicesDetails([deviceId]);

			try {
				intro(launcherSummaryInteractive,
					this.restArgs.join(' '),
					this.ownArgv.logDir,
					deviceDetails.displayName,
				);
				const exitCode = await runTestOnDevice(
					this.restArgs, this.ownArgv, deviceDetails, deviceAccessToken, INTERACTIVE
				);
				const withError = exitCode !== 0;

				finishInteractive(withError);
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
