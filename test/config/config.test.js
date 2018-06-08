const assert = require('assert');
const path = require('path');
const fs = require('fs');
const config = require('../../config/index');

describe('config', () => {
	const rcFilePath = path.resolve(process.cwd(), '.suitestrc');

	it('should return empty object if config file not found', () => {
		var a = config.readRcConfig();
		assert.deepEqual(config.readRcConfig({}), {}, 'empty object');
	});

	it('should find and read rc file', () => {
		fs.writeFileSync(rcFilePath, '{"test": "test"}');

		const configObj = config.readRcConfig();

		assert.deepEqual(configObj, {
			test: 'test',
			configs: [rcFilePath],
			config: rcFilePath,
		}, 'correct json');
		assert.strictEqual('_' in config, false, 'cli arges not included');

		fs.writeFileSync(rcFilePath, 'test = test');
		assert.strictEqual(config.readRcConfig().test, 'test', 'correct ini');

		// remove test file
		fs.unlinkSync(rcFilePath);
	});

	it('should throw error in case of invalid rc json', () => {
		// add test rc file
		fs.writeFileSync(rcFilePath, '{invalid: undefined}');
		assert.throws(() => config.readRcConfig(), /Error/);
		// remove test rc file
		fs.unlinkSync(rcFilePath);
	});
});
