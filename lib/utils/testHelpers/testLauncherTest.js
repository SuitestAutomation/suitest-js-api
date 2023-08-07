#!/usr/bin/env node

require('../../../config/setTestConfig');
require('../../utils/testHelpers/mockWebSocket');
const testServer = require('../../utils/testServer');
const nock = require('nock');
const stubDeviceInfoFeed = require('./mockDeviceInfo');

process.on('exit', () => {
	nock.cleanAll();
	process.exit();
});

async function setUp() {
	await testServer.restart();

	stubDeviceInfoFeed('deviceId');

	const suitest = require('../../../index');

	suitest.logger.success = () => null;
	suitest.webSockets = require('../../api/webSockets');

	require('../../../bin/suitest');
}

setUp();
