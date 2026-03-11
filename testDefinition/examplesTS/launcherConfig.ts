import * as suitest from '../../index';

const config: suitest.SuitestLauncherConfigurationFile = {
	tokenId: 'token-id',
	tokenPassword: '<PASSWORD>',
	deviceId: 'device-id',
	appConfigId: 'app-config-id',
	preset: ['preset1'],
	presets: {
		preset1: {
			device: 'device-id',
			config: {
				configId: 'config-id',
				url: 'https://example.com',
				suitestify: true,
				domainList: ['example.com'],
				mapRules: [{
					methods: ['GET'],
					url: 'https://example.com',
					type: 'replace',
					toUrl: 'https://example.org',
				}],
				codeOverrides: {},
				configVariables: [{
					key: 'key',
					value: 'value',
				}],
				openAppOverrideTest: 'b3b6c5f7-6d7a-4e62-9b34-3d39a6db5a1c',
			},
		},
	},
	inspect: true,
	inspectBrk: 'true',
	logLevel: 'debug',
	logDir: 'logs',
	timestamp: 'iso',
	configFile: 'config.json',
	overrideConfigFile: 'override.json',
	disallowCrashReports: false,
	defaultTimeout: 3000,
	screenshotDir: 'screenshots',
	includeChangelist: false,
	recordingOption: 'manualstart',
	webhookUrl: 'https://hooks.example.com/suitest',
};
