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

	return filter(d => devicesIds.includes(d.deviceId), devices);
}

/**
 * Returns device name for logs based on device information
 * @param {object} deviceInfo
 */
function getDeviceName(deviceInfo) {
	if (deviceInfo.manufacturer || deviceInfo.model) {
		return `${deviceInfo.manufacturer} - ${deviceInfo.model}`;
	}

	return '';
}

module.exports = {
	getDevicesDetails,
	getDeviceName,
};
