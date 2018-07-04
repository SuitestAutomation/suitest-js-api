const assert = require('assert');
const nock = require('nock');
const logger = require('../../lib/utils/logger');
const sinon = require('sinon');
const envVars = require('../../lib/constants/enviroment');
const packageData = require('../../package.json');
const texts = require('../../lib/texts');

const packageMetadataHelper = require('../../lib/utils/packageMetadataHelper');

function setLauncherVersion(version) {
	process.env[envVars.SUITEST_LAUNCHER_VERSION] = version;
}

const {version} = packageData;

describe('packageMetadataHelper util', () => {
	after(async() => {
		nock.cleanAll();
	});

	afterEach(() => {
		if (logger.warn.restore) {
			logger.warn.restore();
		}
		delete process.env[envVars.SUITEST_LAUNCHER_VERSION];
	});

	it('test fetchLatestSuitestVersion', async() => {
		const {fetchLatestSuitestVersion} = packageMetadataHelper;

		nock('https://registry.npmjs.org')
			.get('/suitest-js-api').reply(200, {
				'dist-tags': {
					'latest': '1.4.1',
				},
				versions: {
					'1.4.1': {
						name: 'suitest-js-api',
						version: '1.4.1',
					},
				},
			});
		const latestVersion = await fetchLatestSuitestVersion();

		assert.equal(latestVersion, '1.4.1');
	});

	it('warnLauncherAndLibHasDiffVersions util', () => {
		const {warnLauncherAndLibHasDiffVersions} = packageMetadataHelper;

		sinon.stub(logger, 'warn');
		setLauncherVersion(version);
		warnLauncherAndLibHasDiffVersions();
		assert.equal(logger.warn.callCount, 0);

		setLauncherVersion('1.0.0');
		warnLauncherAndLibHasDiffVersions();
		assert.equal(logger.warn.callCount, 1);
		assert.ok(logger.warn.calledWith(texts['tl.differentLauncherAndLibVersions'](version, '1.0.0')));
	});

	it('warnNewVersionAvailable util', () => {
		const {warnNewVersionAvailable} = packageMetadataHelper;

		sinon.stub(logger, 'warn');
		warnNewVersionAvailable();
		warnNewVersionAvailable('');
		warnNewVersionAvailable('', '');
		assert.equal(logger.warn.callCount, 0);

		warnNewVersionAvailable('1.0.0', '1.1.1');
		assert.equal(logger.warn.callCount, 1);
		assert.ok(logger.warn.calledWith(texts['tl.newVersionAvailable']('1.1.1')));
	});
});
