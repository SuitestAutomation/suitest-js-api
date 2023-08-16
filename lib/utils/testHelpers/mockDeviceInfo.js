const nock = require('nock');
const config = require('../../../config');
const makeUrlFromArray = require('../makeUrlFromArray');
const endpoints = require('../../api/endpoints');

const device = {
	manufacturer: 'Google',
	model: 'Chrome',
	owner: 'Suitest, Inc.',
	firmware: '68.0.3440.106',
	isShared: false,
	modelId: '046b8cbc-1278-4c01-ae2e-5db509c19d33',
	platforms: ['browser'],
	status: 'OFF',
};

function stubDeviceInfoFeed(deviceId) {
	nock(config.apiUrl)
		.get(makeUrlFromArray([endpoints.device, {deviceId}]))
		.reply(200, device);
}

module.exports = stubDeviceInfoFeed;
