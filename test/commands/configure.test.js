const assert = require('assert');
const sinon = require('sinon');

const {logger, config, configuration, setDefaultTimeout, setLogLevel} = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

const cachedConfig = {...config};

describe('configure', () => {
	before(async() => {
		sinon.stub(logger, 'warn');
	});

	after(async() => {
		logger.warn.restore();
		configuration.override(cachedConfig);
	});

	it('should set config override', async() => {
		setDefaultTimeout(4000);
		assert.equal(configuration.config.defaultTimeout, 4000, 'setDefaultTimeout');
		setLogLevel('debug');
		assert.equal(configuration.config.logLevel, 'debug', 'setLogLevel');
		testInputErrorSync(setLogLevel, ['errror']);
		testInputErrorSync(setDefaultTimeout, [true]);
	});
});
