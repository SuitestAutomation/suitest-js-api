const request = require('../api/request');
const endpoints = require('../api/endpoints');
const R = require('ramda');
const SuitestError = require('./SuitestError');
const {suitestServerError} = require('../texts');

/**
 * Return devices details
 * @param {Object} instance main class instance
 * @param {array} devicesList array of devices id's
 * @returns {object}
 */
async function getDevicesDetails({authContext}, devicesList) {
	const authorizeHttp = await authContext.authorizeHttp(endpoints.device, {
		method: 'GET',
	});

	let devices = [];

	for (const {device: deviceId} of devicesList) {
		const response = await request([endpoints.device, {deviceId}], authorizeHttp, function(res) {
			if (res.status === 404) {
				return undefined;
			}
			throw new SuitestError(
				suitestServerError(`[getDeviceDetail(deviceId: ${deviceId})]`, res.status, res.statusText),
				SuitestError.SERVER_ERROR,
			);
		});
		if (response) {
			devices.push({
				deviceId,
				...response,
			});
		}
	}

	return devicesList.reduce((result, d) => {
		const device = devices.find(respDev => respDev.deviceId === d.device);

		if (device) {
			result.push({
				...device,
				...R.pick(['config', 'presetName'], d),
				displayName: getDeviceName(device),
				shortDisplayName: getDeviceName(device, true),
			});
		}

		return result;
	}, []);
}

/**
 * Returns device name for logs based on device information
 * @param {object} deviceInfo
 * @param {boolean} short
 */
function getDeviceName(deviceInfo, short = false) {
	const {manufacturer, model, customName, deviceId} = deviceInfo;

	let name;

	if (customName)
		name = short ? customName : `${customName} (${manufacturer} ${model})`;
	else
		name = short ? `${model}` : `${manufacturer} ${model}`;

	if (short && name.length > 15)
		name = `${model} (${deviceId.slice(0, 3)})`;

	return name;
}

module.exports = {
	getDevicesDetails,
	getDeviceName,
};
