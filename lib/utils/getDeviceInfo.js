const request = require('../api/request');
const endpoints = require('../api/endpoints');
const fetch = require('node-fetch');

/**
 * Return devices details
 * @param {Object} instance main class instance
 * @param {array} devicesList array of devices id's
 * @returns {object}
 */
async function getDevicesDetails({authContext}, devicesList) {
	const authorizeHttp = await authContext.authorizeHttp(endpoints.devices, {
		method: 'GET',
	});
	let response = await request(
		[endpoints.devices, null, {limit: 100}],
		authorizeHttp,
	);
	let devices = [...response.values];

	while (response.next) {
		response = await fetch(response.next, authorizeHttp);
		response = await response.json();
		devices = [...devices, ...response.values];
	}

	const usedDevices = devicesList.reduce((a, b) => {
		const foundDevice = devices.find(respDev => respDev.deviceId === b.device);

		return [...a, {...foundDevice, config: b.config}];
	}, []);

	return usedDevices;
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
		name = `${model} (${deviceId.substr(0, 3)})`;

	return name;
}

module.exports = {
	getDevicesDetails,
	getDeviceName,
};
