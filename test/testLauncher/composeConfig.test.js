const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const mock = require('mock-fs');

const SuitestError = require('../../lib/utils/SuitestError');
const {
	readUserConfig,
	readRcConfig,
	findExtendConfigs,
	readConfigFile,
} = require('../../lib/testLauncher/composeConfig');

describe('testLauncher readUserConfig', () => {
	afterEach(() => {
		mock.restore();
	});

	it('readUserConfig method should process config file correctly', () => {
		const configObj = {test: true};

		sinon.stub(fs, 'readFileSync').returns(JSON.stringify(configObj));

		try {
			assert.deepStrictEqual(readUserConfig(''), configObj, 'parsed successfully');
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readUserConfig method should throw correct errors', () => {
		assert.throws(
			() => readUserConfig('./__non-such-dir__/__non-such-file__.json'),
			err => err.type === SuitestError.type,
			'falied to read file',
		);

		sinon.stub(fs, 'readFileSync').returns('invalid json');

		try {
			assert.throws(
				() => readUserConfig(''),
				err => err.type === SuitestError.type,
				'falied to parse json',
			);
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readRcConfig should return corresponding result when argument was past', () => {
		const configContent = '{"test": "test"}';
		const mockPath = './fakepath/.suitestrc';

		mock({
			[mockPath]: configContent,
		});

		assert.deepStrictEqual(
			readRcConfig(mockPath),
			{
				test: 'test',
				config: mockPath,
			},
		);
	});

	it('readRcConfig should return corresponding result without any arguments', () => {
		const configContent = '{"test": "test"}';
		const mockPath = path.join(process.cwd(), '.suitestrc');

		mock({
			[mockPath]: configContent,
		});

		assert.deepStrictEqual(
			readRcConfig(),
			{
				test: 'test',
				config: mockPath,
			},
		);
	});

	it('readRcConfig should return corresponding result if config file is locating in upper directory', () => {
		const configContent = '{"test": "test"}';
		const mockPath = path.join(process.cwd(), '../', '.suitestrc');

		mock({
			[mockPath]: configContent,
		});

		assert.deepStrictEqual(
			readRcConfig(),
			{
				test: 'test',
				config: mockPath,
			},
		);
	});

	describe('Should work on linux platforms', function() {
		this.beforeAll(function() {
			delete require.cache[require.resolve('../../lib/testLauncher/composeConfig')];
			sinon.stub(process, 'platform').value('LinuxOS');
		});

		it('readRcConfig should return corresponding result without any arguments on Linux', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test"}';
			const mockPath = path.join('/etc', 'suitestrc');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test',
					config: mockPath,
				},
			);
		});

		this.afterAll(function() {
			sinon.restore();
			delete require.cache[require.resolve('../../lib/testLauncher/composeConfig')];
		});
	});

	it('readRcConfig should return empty object', () => {
		assert.deepStrictEqual(readRcConfig(), {});
	});

	it('findExtendConfigs should process correctly', () => {
		const configContentMain = '{"test": "test1"}';
		const mockPathMain = path.join(process.cwd(), '.suitestrc.json5');
		const configContentExtended = '{"testExtends": "testExtends"}';
		const mockPathExtended = './fakepath/.suitestrc.yaml';

		mock({
			[mockPathMain]: configContentMain,
			[mockPathExtended]: configContentExtended,
		});

		const configFile = readConfigFile(mockPathMain);

		assert.deepStrictEqual(
			findExtendConfigs(
				configFile,
				mockPathExtended,
				mockPathMain,
				[mockPathMain],
			),
			{
				testExtends: 'testExtends',
				test: 'test1',
			},
		);
	});
});
