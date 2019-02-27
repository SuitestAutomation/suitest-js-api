const assert = require('assert');
const nock = require('nock');
const logger = require('../../lib/utils/logger');
const sinon = require('sinon');
const texts = require('../../lib/texts');

const packageMetadataHelper = require('../../lib/utils/packageMetadataHelper');

describe('packageMetadataHelper util', () => {
	after(async() => {
		nock.cleanAll();
	});

	afterEach(() => {
		if (logger.warn.restore) {
			logger.warn.restore();
		}
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

	it('warnWhenDiffVersions util', () => {
		const {warnWhenDiffVersions} = packageMetadataHelper;

		sinon.stub(logger, 'warn');
		warnWhenDiffVersions('1.0.0', '1.0.0');
		assert.equal(logger.warn.callCount, 0);

		warnWhenDiffVersions('1.0.0', '1.0.1');
		assert.equal(logger.warn.callCount, 1);
		assert.ok(logger.warn.calledWith(texts['tl.differentLauncherAndLibVersions']('1.0.0', '1.0.1')));
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
