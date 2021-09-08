const {
	finishInteractive,
	handleLauncherError,
	validateInput,
	runAllDevices,
	prepareTestPackExecution,
	runTestOnDevice,
	getVersion,
	isDebugMode,
	addLauncherIpcListeners,
	throwDebugInAutomatedError,
	increaseMaxListeners,
} = require('../utils/testLauncherHelper');
const {AUTOMATED, INTERACTIVE, TEST_COMMAND, TOKEN} = require('../constants/modes');
const sessionConstants = require('../constants/session');
const {getDevicesDetails} = require('../utils/getDeviceInfo');
const {openSessionUnchained} = require('../commands/openSession');
const {closeSessionUnchained} = require('../commands/closeSession');
const {captureException} = require('../utils/sentry/Raven');
const {
	launcherGreeting,
	launcherSummaryInteractive,
	launcherWrongDeviceId,
} = require('../texts');
const {version} = require('../../package.json');
const SuitestError = require('../utils/SuitestError');
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
			/* istanbul ignore if  */
			if (isDebugMode(this.ownArgv)) {
				// debugging not allowed in automated session
				throwDebugInAutomatedError();
			}

			const devices = Object.keys(this.ownArgv.presets)
				.map((key) => {
					return {
						device: this.ownArgv.presets[key].device || this.ownArgv.presets[key].deviceId,
						config: this.ownArgv.presets[key].config || this.ownArgv.presets[key].configId,
					};
				});

			await suitest.authContext.setContext(
				sessionConstants.TOKEN,
				this.ownArgv.tokenId,
				this.ownArgv.tokenPassword,
			);

			const devicesWithDetails = await getDevicesDetails(suitest, devices);

			const ipcPort = await ipcServer.start({
				...this.ownArgv,
				launcherVersion: version,
				sessionToken: Buffer.from(`${this.ownArgv.tokenId}:${this.ownArgv.tokenPassword}`).toString('base64'),
				isDebugMode: false,
				sessionType: TOKEN,
			});

			addLauncherIpcListeners();
			// increase stdout max listeners based on number of child processes to avoid node warning
			increaseMaxListeners(process.stdout, devices.length, this.ownArgv.concurrency);

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

	async runAutomatedSession() {
		// TODO: fix after removing interactive and automated modes
		suitest.logger.intro(launcherGreeting, version, AUTOMATED);
		validateInput(AUTOMATED.toUpperCase(), this.ownArgv);

		try {
			/* istanbul ignore if  */
			if (isDebugMode(this.ownArgv)) {
				// debugging not allowed in automated session
				throwDebugInAutomatedError();
			}

			const {devices, deviceAccessToken} = await prepareTestPackExecution(this.ownArgv);
			const devicesWithDetails = await getDevicesDetails(suitest, devices);
			const ipcPort = await ipcServer.start({
				...this.ownArgv,
				launcherVersion: version,
				sessionToken: deviceAccessToken,
				isDebugMode: false,
				sessionType: AUTOMATED,
			});

			addLauncherIpcListeners();
			// increase stdout max listeners based on number of child processes to avoid node warning
			increaseMaxListeners(process.stdout, devices.length, this.ownArgv.concurrency);

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
		// TODO: fix after removing interactive and automated modes
		suitest.logger.intro(launcherGreeting, version, INTERACTIVE);
		validateInput(INTERACTIVE.toUpperCase(), this.ownArgv);

		try {
			const {username, password, orgId, deviceId} = this.ownArgv;
			const {deviceAccessToken} = await openSessionUnchained(suitest, {
				username,
				password,
				orgId,
			});
			const [deviceDetails] = await getDevicesDetails(suitest, [deviceId]);

			if (!deviceDetails)
				throw new SuitestError(launcherWrongDeviceId(
					deviceId,
					SuitestError.INVALID_INPUT
				));

			try {
				suitest.logger.intro(launcherSummaryInteractive,
					this.restArgs.join(' '),
					this.ownArgv.logDir,
					deviceDetails.displayName,
				);

				const ipcPort = await ipcServer.start({
					...this.ownArgv,
					launcherVersion: version,
					sessionToken: deviceAccessToken,
					isDebugMode: isDebugMode(this.ownArgv),
					sessionType: INTERACTIVE,
				});

				addLauncherIpcListeners();

				const exitCode = await runTestOnDevice(
					this.restArgs, this.ownArgv, deviceDetails, INTERACTIVE, ipcPort
				);
				const withError = exitCode !== 0;

				finishInteractive(withError);
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
