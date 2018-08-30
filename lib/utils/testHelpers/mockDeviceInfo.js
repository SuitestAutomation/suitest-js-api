const nock = require('nock');
const config = require('../../../config').config;
const makeUrlFromArray = require('../makeUrlFromArray');
const endpoints = require('../../api/endpoints');

function stubDeviceInfoFeed(deviceId) {
	nock(config.apiUrl)
		.get(makeUrlFromArray([endpoints.devices, null, {limit: 100}]))
		.reply(
			200,
			{
				'values': [
					{
						deviceId: deviceId,
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

			}
		);
}

module.exports = stubDeviceInfoFeed;
