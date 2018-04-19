#!/usr/bin/env node

require('../../../config/setTestConfig');
const nock = require('nock');
const makeUrlFromArray = require('../makeUrlFromArray');
const endpoints = require('../../api/endpoints');
const config = require('../../../config').config;

process.on('exit', () => {
	nock.cleanAll();
	process.exit();
});

// automated
nock(config.apiUrl)
	.post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 10}]))
	.reply(
		200,
		{
			deviceAccessToken: 'deviceAccessToken',
			testPack: {
				devices: [{deviceId: '1'}],
			},
		}
	);

// automated no devices
nock(config.apiUrl)
	.post(makeUrlFromArray([endpoints.testPackGenTokens, {id: 20}]))
	.reply(
		200,
		{
			deviceAccessToken: 'deviceAccessToken',
			testPack: {
				devices: [],
			},
		}
	);

// interactive
nock(config.apiUrl)
	.post(makeUrlFromArray([endpoints.session, {
		username: 'userEmail',
		password: 'userPass',
		orgId: 'orgId',
	}]))
	.reply(200, {deviceAccessToken: 'deviceAccessToken'});

require('../../testLauncher/index');

