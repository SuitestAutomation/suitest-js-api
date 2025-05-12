import * as suitest from '../../index';

/**
 * @description Asserts that a type `T` extends another type `U`. This method performs no runtime operations but enforces the relationship between types at compile time.
 */
function assertExtends<T extends U, U>(): void {
	// does nothing, verification happens through type constraint
}

async function main() {
	// openSession
	const openSessionResult: suitest.OpenSessionResult = await suitest.openSession({
		tokenId: 'token-id',
		tokenPassword: '<PASSWORD>',
	});
	const accessToken: string = openSessionResult.accessToken;

	// close session
	const closeSessionResult: void = await suitest.closeSession();

	// setAppConfig
	const setAppConfigResult: void = await suitest.setAppConfig('string', {
		configVariables: [{
			key: 'string',
			value: 'string'
		}]
	});

	// pairDevice
	const deviceData: suitest.DeviceData = await suitest.pairDevice('device-id');

	// releaseDevice
	const releaseDeviceResult: void = await suitest.releaseDevice();

	// getAppConfig
	const config: suitest.AppConfiguration = await suitest.getAppConfig();

	// startRecording
	const recordingUrl: string | undefined = await suitest.startRecording();
	assertExtends<string, typeof recordingUrl>();
	assertExtends<undefined, typeof recordingUrl>();

	// stopRecording
	const stopRecordingResult: void = await suitest.stopRecording();


	// AuthContext functions

	// authorizeHttp
	const authorizedHttpRequest: {
		method: 'GET',
		headers: Record<string, string>,
	} = await suitest.authContext.authorizeHttp('request-key', {method: 'GET'});

	// authorizeWs
	const authorizedWsRequest: {
		type: string,
		data: string,
	} = await suitest.authContext.authorizeWs({type: 'message-type', data: 'some data'}, 'command');

	// authorizedWsConnection
	const authorizedWsConnectionRequest: {
		headers: Record<string, string>,
	} = await suitest.authContext.authorizeWsConnection({}, 'command');
}
