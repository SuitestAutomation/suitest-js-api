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
			() => readUserConfig(path.join('.', '__non-such-dir__', '__non-such-file__.json')),
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
		const mockPath = path.join('.', 'fakepath', '.suitestrc');

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

	it('readRcConfig should return corresponding result without any arguments in project dir', () => {
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

	describe('Should find default paths on Windows platforms', () => {
		before(() => {
			delete require.cache[require.resolve('../../lib/testLauncher/composeConfig')];

			this.userEnv = process.env.USERPROFILE;
			process.env.USERPROFILE = path.join('C:', 'Users', 'MockUserProfile');

			sinon.stub(process, 'platform').value('win32');
		});

		it('readRcConfig should find config in %USERPROFILE%\\.config\\suitest\\config', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test1"}';
			const mockPath = path.join(process.env.USERPROFILE, '.config', 'suitest', 'config');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test1',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in %USERPROFILE%\\.config\\suitest', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test2"}';
			const mockPath = path.join(process.env.USERPROFILE, '.config', 'suitest');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test2',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in %USERPROFILE%\\.suitest\\config', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test3"}';
			const mockPath = path.join(process.env.USERPROFILE, '.suitest', 'config');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test3',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in %USERPROFILE%\\.suitestrc', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test4"}';
			const mockPath = path.join(process.env.USERPROFILE, '.suitestrc');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test4',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should not search in linux specific directories if the platform is win32', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test1"}';
			const mockPath1 = path.join('/etc', 'suitestrc');
			const mockPath2 = path.join('/etc', 'suitest', 'config');

			mock({
				[mockPath1]: configContent,
				[mockPath2]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{},
			);
		});

		after(() => {
			sinon.restore();
			process.env.USERPROFILE = this.userEnv;
			delete require.cache[require.resolve('../../lib/testLauncher/composeConfig')];
		});
	});

	describe('Should find default paths on Linux platforms', () => {
		before(() => {
			delete require.cache[require.resolve('../../lib/testLauncher/composeConfig')];
			this.homeEnv = process.env.HOME;
			process.env.HOME = path.join('/home');
			sinon.stub(process, 'platform').value('LinuxOS');
		});

		it('readRcConfig should find config in /etc/suitestrc', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test1"}';
			const mockPath = path.join('/etc', 'suitestrc');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test1',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in /etc/suitest/config', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test2"}';
			const mockPath = path.join('/etc', 'suitest', 'config');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test2',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.config/suitest/config', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test3"}';
			const mockPath = path.join(process.env.HOME, '.config', 'suitest', 'config');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test3',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.config/suitest', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test4"}';
			const mockPath = path.join(process.env.HOME, '.config', 'suitest');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test4',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.suitest/config', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test5"}';
			const mockPath = path.join(process.env.HOME, '.suitest', 'config');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test5',
					config: mockPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.suitestrc', () => {
			const {readRcConfig} = require('../../lib/testLauncher/composeConfig');
			const configContent = '{"test": "test6"}';
			const mockPath = path.join(process.env.HOME, '.suitestrc');

			mock({
				[mockPath]: configContent,
			});

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test6',
					config: mockPath,
				},
			);
		});

		after(() => {
			sinon.restore();
			process.env.HOME = this.homeEnv;
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
		const mockPathExtended = path.join('.', 'fakepath', 'suitestrc.yaml');

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
