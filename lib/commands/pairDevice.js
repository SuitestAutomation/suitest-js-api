/**
 * Pair with device command.
 * Request control of the device.
 * After this command is resolved, interactive or automated time starts to count until user calls release device method or timeout passes.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {validate, validators} = require('../../lib/validataion');
const {authContext, pairedDeviceContext} = require('../context');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, connectedToDevice, connectingToDevice} = require('../texts');
const {logVerboseMessage} = require('../utils/logger');

/**
 * Pair with device
 * @param {string} deviceId - device to connect to
 * @returns {ChainablePromise.<DeviceData>}
 */
async function pairDevice(deviceId) {
	logVerboseMessage(connectingToDevice(deviceId));
	// validate deviceId string to be in uuid format
	validate(validators.UUID, deviceId, invalidInputMessage(pairDevice.name, 'Device id'));
	// authorize
	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.pairDevice,
		deviceId,
	}, pairDevice.name);
	// make ws request
	const res = await webSockets.send(authedContent);

	pairedDeviceContext.clear();
	pairedDeviceContext.setContext({deviceId});
	logVerboseMessage(connectedToDevice(deviceId));

	return res;
}

module.exports = {
	pairDevice: chainPromise(pairDevice),
	pairDeviceUnchained: pairDevice,
};
