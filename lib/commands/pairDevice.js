/**
 * Pair with device command.
 * Request control of the device.
 * After this command is resolved, time starts to count until user calls release device method or timeout passes.
 */

const wsContentTypes = require('../api/wsContentTypes');
const {validate, validators} = require('../validation');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, connectedToDevice, connectingToDevice, launcherWrongDeviceId} = require('../texts');
const {getDevicesDetails} = require('../utils/getDeviceInfo');
const SuitestError = require('../utils/SuitestError');

/**
 * Pair with device
 * @param {Object} instance - main class instance
 * @param {string} deviceId - device to connect to
 * @param {Object | undefined} recordingSettings - {recording, webhookUrl} object. Optional.
 * @returns {ChainablePromise.<DeviceData>}
 */
async function pairDevice(
	{webSockets, authContext, logger, pairedDeviceContext, config},
	deviceId,
	recordingSettings
) {
	// validate deviceId string to be in uuid format
	validate(validators.UUID, deviceId, invalidInputMessage(pairDevice.name, 'Device id'));

	const recordingDefault = recordingSettings ? recordingSettings.recording : 'none';
	const webhookUrlDefault = recordingSettings ? recordingSettings.webhookUrl : undefined;

	const [deviceDetails] = await getDevicesDetails({authContext}, [{device: deviceId}]);

	if (!deviceDetails)
		throw new SuitestError(
			launcherWrongDeviceId(deviceId),
			SuitestError.INVALID_INPUT,
		);

	const deviceName = deviceDetails.displayName;

	const recordingOption = config.recordingOption || recordingDefault;

	const webhookUrlOption = config.webhookUrl || webhookUrlDefault;

	logger.delayed(connectingToDevice(deviceName, deviceId), 4e3);

	// authorize
	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.pairDevice,
		deviceId,
		recording: recordingOption,
		webhookUrl: webhookUrlOption,
	}, pairDevice.name);
	// make ws request
	const res = await webSockets.send(authedContent);

	pairedDeviceContext.clear();
	pairedDeviceContext.setContext(deviceDetails);

	logger.log(connectedToDevice(deviceName, deviceId));

	return res;
}

module.exports = {
	pairDevice: chainPromise(pairDevice),
	pairDeviceUnchained: pairDevice,
};
