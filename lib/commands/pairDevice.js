/**
 * Pair with device command.
 * Request control of the device.
 * After this command is resolved, interactive or automated time starts to count until user calls release device method or timeout passes.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {validate, validators} = require('../validation');
const {authContext, pairedDeviceContext} = require('../context');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, connectedToDevice, connectingToDevice, launcherWrongDeviceId} = require('../texts');
const logger = require('../utils/logger');
const {getDevicesDetails} = require('../utils/getDeviceInfo');
const SuitestError = require('../utils/SuitestError');

/**
 * Pair with device
 * @param {string} deviceId - device to connect to
 * @returns {ChainablePromise.<DeviceData>}
 */
async function pairDevice(deviceId) {
	// validate deviceId string to be in uuid format
	validate(validators.UUID, deviceId, invalidInputMessage(pairDevice.name, 'Device id'));

	const [deviceDetails] = await getDevicesDetails([deviceId]);

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
