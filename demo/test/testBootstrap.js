/*
 * This file must be included to you test run command with Mocha's -r argument.
 *
 * It includes Authentication and device connection for Suitest JS API lib
 */
const suitest = require('../../index.js');

let config;

try {
	config = require('../testConfig.js');
} catch (e) {
	console.error(`
	You need to copy testConfig.js.dist file and adjust it according to your setup.
	Check out readme file.
`);

	throw e;
}

async function startInteractiveSession() {
	try {
		// Start interactive session
		await suitest.openSession({
			username: config.username,
			password: config.password,
			orgId: config.orgId,
		});
	} catch (e) {
		console.error(e);
		console.error(`
	Failed to login to Suitest
	Check you credentials and network status and try again.
`);
		// Mocha wouldn't stop if just throw an error here
		process.exit(1);
	}

	try {
		// Connect to device
		await suitest.pairDevice(config.deviceId);
	} catch (e) {
		console.error(e);
		console.error(`
	Failed to connect to requested device.
	Check if device is enabled in suitest, you have access to it and it is not occupied by someone.
`);
		// Mocha wouldn't stop if just throw an error here
		process.exit(1);
	}

	try {
		// Set up application config we're going to work with
		await suitest.setAppConfig(config.configId);
	} catch (e) {
		console.error(e);
		console.error(`
	Failed to set up correct app config.
`);
		process.exit(1);
	}
}

async function startAutomatedSession() {
	let deviceId;

	try {
		// Start test pack
		const response = await suitest.startTestPack({
			testPackId: config.testPackId,
			accessTokenKey: config.accessTokenKey,
			accessTokenPassword: config.accessTokenPassword,
		});

		deviceId = response.testPack.devices[0].deviceId; // pick first device from test pack
	} catch (e) {
		console.error(e);
		console.error(`
	Failed to start test pack
	Check you credentials, network status and test pack and try again.
`);
		// Mocha wouldn't stop if just throw an error here
		process.exit(1);
	}

	try {
		// Connect to the first device in the test pack
		await suitest.pairDevice(deviceId);
	} catch (e) {
		console.error(e);
		console.error(`
	Failed to connect to requested device.
	Check if device is enabled in suitest, you have access to it and it is not occupied by someone.
`);
		// Mocha wouldn't stop if just throw an error here
		process.exit(1);
	}
}

before(async() => {
	if (config.automatedSession) {
		await startAutomatedSession();
	} else {
		await startInteractiveSession();
	}
});

after(async() => {
	// Disconnect from suitest - close session
	await suitest.closeSession();
});

