const {
	finishInteractive,
	handleLauncherError,
	validateInput,
	runAllDevices,
	prepareTestPackExecution,
	runTestOnDevice,
	getVersion,
	getDebugPort,
	addLauncherIpcListeners,
	throwDebugInAutomatedError,
	increaseMaxListeners,
} = require('../utils/testLauncherHelper');
const {AUTOMATED, INTERACTIVE, TEST_COMMAND} = require('../constants/modes');
const {getDevicesDetails} = require('../utils/getDeviceInfo');
const {openSessionUnchained} = require('../commands/openSession');
const {closeSessionUnchained} = require('../commands/closeSession');
const {captureException} = require('../utils/sentry/Raven');
const {intro} = require('../utils/logger');
const {
	launcherGreeting,
	launcherSummaryInteractive,
	launcherWrongDeviceId,
} = require('../texts');
const {version} = require('../../package.json');
const SuitestError = require('../utils/SuitestError');
const ipcServer = require('./ipc/server');

class SuitestLauncher {
	constructor(ownArgv = {}, restArgs = []) {
		this.ownArgv = ownArgv;
		this.restArgs = restArgs;
		validateInput(TEST_COMMAND, this.restArgs);
		getVersion().then(version => {
			this.latestSuitestVersion = version;
		});
	}

	async runAutomatedSession() {
		intro(launcherGreeting, version, AUTOMATED);
		validateInput(AUTOMATED.toUpperCase(), this.ownArgv);

		try {
			/* istanbul ignore if  */
			if (getDebugPort(this.ownArgv)) {
				// debugging not allowed in automated session
				throwDebugInAutomatedError();
			}

			const {devices, deviceAccessToken} = await prepareTestPackExecution(this.ownArgv);
			const devicesWithDetails = await getDevicesDetails(devices);
			const ipcPort = await ipcServer.start({
				...this.ownArgv,
				launcherVersion: version,
				sessionToken: deviceAccessToken,
				isDebugMode: false,
				sessionType: AUTOMATED,
			});

			addLauncherIpcListeners();
			// increase stdout max listeners based on number of devices to avoid node warning
			increaseMaxListeners(process.stdout, devices.length * 2);

			try {
				await runAllDevices(
					this.restArgs,
					this.ownArgv,
					devicesWithDetails,
					ipcPort,
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

			if (!deviceDetails)
				throw new SuitestError(launcherWrongDeviceId(
					deviceId,
					SuitestError.INVALID_INPUT
				));

			try {
				intro(launcherSummaryInteractive,
					this.restArgs.join(' '),
					this.ownArgv.logDir,
					deviceDetails.displayName,
				);

				const ipcPort = await ipcServer.start({
					...this.ownArgv,
					launcherVersion: version,
					sessionToken: deviceAccessToken,
					isDebugMode: !!getDebugPort(this.ownArgv),
					sessionType: INTERACTIVE,
				});

				addLauncherIpcListeners();

				const exitCode = await runTestOnDevice(
					this.restArgs, this.ownArgv, deviceDetails, INTERACTIVE, ipcPort
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
