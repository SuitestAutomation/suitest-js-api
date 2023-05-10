/* eslint-disable key-spacing */

/**
 * Api endpoints
 */

const endpoints = {
	apps:                  '/apps',
	appById:               '/apps/:appId',
	appTags:               '/apps/:appId/tags',
	appConfigs:            '/apps/:appId/configs',
	appConfigById:         '/apps/:appId/configs/:configId',
	appTestDefinitions:    '/apps/:appId/test-definitions',
	appTestDefinitionById: '/apps/:appId/versions/:versionId/tests/:testId',
	device:                '/devices/:deviceId',
	testRun:               '/test-run',
	testRunById:           '/test-run/:testRunId',
	testRunOnDevice:       '/test-run/:testRunId/device/:deviceId',
};

Object.freeze(endpoints);

module.exports = endpoints;
