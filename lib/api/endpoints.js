/* eslint-disable key-spacing */

/**
 * Api endpoints
 */

const endpoints = {
	session:               '/get-interactive-device-access-token',
	sessionClose:          '/invalidate-token',
	testPackGenTokens:     '/test-packs/:id/get-device-access-token',
	apps:                  '/apps',
	appById:               '/apps/:appId',
	appTags:               '/apps/:appId/tags',
	appConfigs:            '/apps/:appId/configs',
	appConfigById:         '/apps/:appId/configs/:configId',
	appTestPacks:          '/apps/:appId/test-packs',
	appTestPackById:       '/apps/:appId/test-packs/:testPackId',
	appTestDefinitions:    '/apps/:appId/test-definitions',
	appTestDefinitionById: '/apps/:appId/test-definitions/:testDefinitionId',
	devices:               '/devices',
	testRun:               '/test-run',
	testRunById:           '/test-run/:testRunId',
	testRunOnDevice:       '/test-run/:testRunId/device/:deviceId',
	testPackRun:           '/test-pack-run',
	testPackRunById:       '/test-pack-run/:testPackRunId',
};

Object.freeze(endpoints);

module.exports = endpoints;
