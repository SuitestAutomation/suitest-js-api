#!/usr/bin/env node

require('../../../config/setTestConfig');
require('../../utils/testHelpers/mockWebSocket');
const testServer = require('../../utils/testServer');
const nock = require('nock');
const makeUrlFromArray = require('../makeUrlFromArray');
const endpoints = require('../../api/endpoints');
const config = require('../../../config').config;
const logger = require('../../utils/logger');
logger.success = () => null;

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
	nock(config.apiUrl)
		.get(makeUrlFromArray([endpoints.devices, null, {limit: 100}]))
		.reply(
			200,
			{
				values: [
					{
						deviceId: '1',
						manufacturer: 'test',
						model: 'test',
					},
				],
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

	// close session
	nock(config.apiUrl)
		.post(endpoints.sessionClose)
		.reply(200, {});

	require('../../../bin/suitest');
}

setUp();
