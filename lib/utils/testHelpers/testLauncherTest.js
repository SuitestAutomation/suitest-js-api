#!/usr/bin/env node

require('../../../config/setTestConfig');
require('../../utils/testHelpers/mockWebSocket');
const testServer = require('../../utils/testServer');
const nock = require('nock');
const makeUrlFromArray = require('../makeUrlFromArray');
const endpoints = require('../../api/endpoints');
const config = require('../../../config');
const stubDeviceInfoFeed = require('./mockDeviceInfo');

process.on('exit', () => {
	nock.cleanAll();
	process.exit();
});

async function setUp() {
	await testServer.restart();

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

	stubDeviceInfoFeed();

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

	// close session
	nock(config.apiUrl)
		.post(endpoints.sessionClose)
		.reply(200, {});

	const suitest = require('../../../index');

	suitest.logger.success = () => null;
	suitest.webSockets = require('../../api/webSockets');

	console.log('wssss', suitest.webSockets);

	require('../../../bin/suitest');
}

setUp();
