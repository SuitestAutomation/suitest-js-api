const assert = require('assert');
const sinon = require('sinon');

const {logger, config, configuration, setDefaultTimeout, setContinueOnFatalError, setLogLevel} = require('../../index');
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
		assert.equal(config.defaultTimeout, 4000, 'setDefaultTimeout');
		setContinueOnFatalError(true);
		assert.equal(config.continueOnFatalError, true, 'setContinueOnFatalError true');
		setContinueOnFatalError(false);
		assert.equal(config.continueOnFatalError, false, 'setContinueOnFatalError false');
		setLogLevel('debug');
		assert.equal(config.logLevel, 'debug', 'setLogLevel');
		testInputErrorSync(setLogLevel, ['errror']);
		testInputErrorSync(setContinueOnFatalError, [3]);
		testInputErrorSync(setDefaultTimeout, [true]);
	});
});
