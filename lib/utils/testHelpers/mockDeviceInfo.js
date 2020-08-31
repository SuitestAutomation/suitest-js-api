const nock = require('nock');
const config = require('../../../config');
const makeUrlFromArray = require('../makeUrlFromArray');
const endpoints = require('../../api/endpoints');

const devices = {
	values: [
		{
			manufacturer: 'Google',
			model: 'Chrome',
			owner: 'Suitest, Inc.',
			firmware: '68.0.3440.106',
			isShared: false,
			modelId: '046b8cbc-1278-4c01-ae2e-5db509c19d33',
			platforms: ['browser'],
			status: 'OFF',
		},
		{
			deviceId: '1',
			manufacturer: 'Google',
			model: 'Chrome',
			owner: 'Suitest, Inc.',
			firmware: '68.0.3440.106',
			isShared: false,
			modelId: '046b8cbc-1278-4c01-ae2e-5db509c19d33',
			platforms: ['browser'],
			status: 'OFF',
		},

		{
			deviceId: 'deviceId',
			manufacturer: 'Google',
			model: 'Chrome',
			owner: 'Suitest, Inc.',
			firmware: '68.0.3440.106',
			isShared: false,
			modelId: '046b8cbc-1278-4c01-ae2e-5db509c19d33',
			platforms: ['browser'],
			status: 'OFF',
		},

	],
};

function stubDeviceInfoFeed(deviceId) {
	devices.values[0].deviceId = deviceId;
	nock(config.apiUrl)
		.get(makeUrlFromArray([endpoints.devices, null, {limit: 100}]))
		.reply(200, devices);
}

module.exports = stubDeviceInfoFeed;
