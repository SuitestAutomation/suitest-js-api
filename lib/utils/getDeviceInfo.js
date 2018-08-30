const request = require('../api/request');
const endpoints = require('../api/endpoints');
const {authContext} = require('../context');
const fetch = require('node-fetch');
const {filter} = require('ramda');

/**
 * Return devices details
 * @param {array} devicesIds array of devices id's
 * @returns {object}
 */
async function getDevicesDetails(devicesIds) {
	const authorizeHttp = await authContext.authorizeHttp(endpoints.devices, {
		method: 'GET',
	});
	let response = await request(
		[endpoints.devices, null, {limit: 100}],
		authorizeHttp
	);
	let devices = [...response.values];

	while (response.next) {
		response = await fetch(response.next, authorizeHttp);
		response = await response.json();
		devices = [...devices, ...response.values];
	}

	const usedDevices = filter(d => devicesIds.includes(d.deviceId), devices);

	usedDevices.forEach(device => {
		device.displayName = getDeviceName(device);
		device.shortDisplayName = getDeviceName(device, true);
	});

	return usedDevices;
}

/**
 * Returns device name for logs based on device information
 * @param {object} deviceInfo
 * @param {boolean} short
 */
function getDeviceName(deviceInfo, short = false) {
	const {manufacturer, model, customName} = deviceInfo;

	if (customName)
		return short? customName : `${customName} (${manufacturer} ${model})`;

	return short? `${model}` : `${manufacturer} ${model}`;
}

module.exports = {
	getDevicesDetails,
	getDeviceName,
};
