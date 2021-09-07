/**
 * Pair with device command.
 * Request control of the device.
 * After this command is resolved, interactive or automated time starts to count until user calls release device method or timeout passes.
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
 * @returns {ChainablePromise.<DeviceData>}
 */
async function pairDevice({webSockets, authContext, logger, pairedDeviceContext}, deviceId, config) {
	// validate deviceId string to be in uuid format
	validate(validators.UUID, deviceId, invalidInputMessage(pairDevice.name, 'Device id'));

	const [deviceDetails] = await getDevicesDetails({authContext}, [{device: deviceId, config}]);

	if (!deviceDetails)
		throw new SuitestError(
			launcherWrongDeviceId(deviceId),
			SuitestError.INVALID_INPUT
		);

	const deviceName = deviceDetails.displayName;

	logger.delayed(connectingToDevice(deviceName, deviceId), 4e3);

	// authorize
	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.pairDevice,
		deviceId,
		config,
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
