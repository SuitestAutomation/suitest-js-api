const assert = require('assert');
const sinon = require('sinon');

const configure = require('../../lib/commands/configure');
const {config, override} = require('../../config');
const logger = require('../../lib/utils/logger');

const cachedConfig = {...config};

describe('confugure', () => {
	before(async() => {
		sinon.stub(logger, 'warn');
	});

	after(async() => {
		logger.warn.restore();
		override(cachedConfig);
	});

	it('should set config ovverride', async() => {
		await configure({
			disallowCrashReports: true,
			continueOnFatalError: true,
			logLevel: 'verbose',
		});
		assert.deepEqual(config, {
			...config,
			disallowCrashReports: true,
			continueOnFatalError: true,
			logLevel: 'verbose',
		}, 'config updated');
	});
});
