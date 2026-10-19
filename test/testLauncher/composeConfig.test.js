const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sinon = require('sinon');

const SuitestError = require('../../lib/utils/SuitestError');

const composeConfigPath = require.resolve('../../lib/testLauncher/composeConfig');

// Default config paths are computed from cwd, HOME and the platform when the module loads
function loadComposeConfig() {
	delete require.cache[composeConfigPath];

	return require(composeConfigPath);
}

function writeConfig(filePath, content) {
	fs.mkdirSync(path.dirname(filePath), {recursive: true});
	fs.writeFileSync(filePath, content);
}

describe('testLauncher readUserConfig', () => {
	const original = {};
	let sandboxDir;

	// Every test runs in its own temporary project dir with its own home dir,
	// so config files of the developer machine are never found
	beforeEach(() => {
		original.cwd = process.cwd();
		original.home = process.env.HOME;
		original.userProfile = process.env.USERPROFILE;

		sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'suitest-compose-config-'));
		const projectDir = path.join(sandboxDir, 'project');
		const homeDir = path.join(sandboxDir, 'home');

		fs.mkdirSync(projectDir);
		fs.mkdirSync(homeDir);
		process.chdir(projectDir);
		process.env.HOME = homeDir;
		process.env.USERPROFILE = homeDir;
	});

	afterEach(() => {
		process.chdir(original.cwd);
		restoreEnv('HOME', original.home);
		restoreEnv('USERPROFILE', original.userProfile);
		fs.rmSync(sandboxDir, {recursive: true, force: true});
		delete require.cache[composeConfigPath];
	});

	function restoreEnv(name, value) {
		if (value === undefined) {
			delete process.env[name];
		} else {
			process.env[name] = value;
		}
	}

	it('readUserConfig method should process config file correctly', () => {
		const {readUserConfig} = loadComposeConfig();
		const configObj = {test: true};

		sinon.stub(fs, 'readFileSync').returns(JSON.stringify(configObj));

		try {
			assert.deepStrictEqual(readUserConfig(''), configObj, 'parsed successfully');
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readUserConfig method should support other types of config files', () => {
		const {readUserConfig} = loadComposeConfig();
		// for test simplicity, only single format is used
		sinon.stub(fs, 'readFileSync').returns('test: true');
		const expected = {test: true};

		try {
			assert.deepStrictEqual(readUserConfig('.file.yml'), expected, 'parsed successfully');
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readUserConfig method should throw correct errors', () => {
		const {readUserConfig} = loadComposeConfig();

		assert.throws(
			() => readUserConfig(path.join('.', '__non-such-dir__', '__non-such-file__.json')),
			err => err.type === SuitestError.type,
			'failed to read file',
		);

		sinon.stub(fs, 'readFileSync').returns('invalid json');

		try {
			assert.throws(
				() => readUserConfig('file.json'),
				err => err.type === SuitestError.type,
				'failed to parse json',
			);
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readRcConfig should return corresponding result when argument was past', () => {
		const {readRcConfig} = loadComposeConfig();
		const configContent = '{"test": "test"}';
		const configPath = path.join('.', 'fakepath', '.suitestrc');

		writeConfig(configPath, configContent);

		assert.deepStrictEqual(
			readRcConfig(configPath),
			{
				test: 'test',
				config: configPath,
			},
		);
	});

	it('readRcConfig should return corresponding result without any arguments in project dir', () => {
		const {readRcConfig} = loadComposeConfig();
		const configContent = '{"test": "test"}';
		const configPath = path.join(process.cwd(), '.suitestrc');

		writeConfig(configPath, configContent);

		assert.deepStrictEqual(
			readRcConfig(),
			{
				test: 'test',
				config: configPath,
			},
		);
	});

	it('readRcConfig should return corresponding result if config file is locating in upper directory', () => {
		const {readRcConfig} = loadComposeConfig();
		const configContent = '{"test": "test"}';
		const configPath = path.join(process.cwd(), '../', '.suitestrc');

		writeConfig(configPath, configContent);

		assert.deepStrictEqual(
			readRcConfig(),
			{
				test: 'test',
				config: configPath,
			},
		);
	});

	describe('Should find default paths on Windows platforms', () => {
		before(() => {
			sinon.stub(process, 'platform').value('win32');
		});

		it('readRcConfig should find config in %USERPROFILE%\\.config\\suitest\\config', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test1"}';
			const configPath = path.join(process.env.USERPROFILE, '.config', 'suitest', 'config');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test1',
					config: configPath,
				},
			);
		});

		it('readRcConfig should find config in %USERPROFILE%\\.config\\suitest', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test2"}';
			const configPath = path.join(process.env.USERPROFILE, '.config', 'suitest');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test2',
					config: configPath,
				},
			);
		});

		it('readRcConfig should find config in %USERPROFILE%\\.suitest\\config', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test3"}';
			const configPath = path.join(process.env.USERPROFILE, '.suitest', 'config');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test3',
					config: configPath,
				},
			);
		});

		it('readRcConfig should find config in %USERPROFILE%\\.suitestrc', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test4"}';
			const configPath = path.join(process.env.USERPROFILE, '.suitestrc');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test4',
					config: configPath,
				},
			);
		});

		it('readRcConfig should not search in linux specific directories if the platform is win32', () => {
			const {readRcConfig} = loadComposeConfig();
			const existsSync = sinon.spy(fs, 'existsSync');

			try {
				assert.deepStrictEqual(readRcConfig(), {});
				assert.ok(
					existsSync.getCalls().every(call => !String(call.args[0]).startsWith('/etc')),
					'/etc is not searched',
				);
			} finally {
				existsSync.restore();
			}
		});

		after(() => {
			sinon.restore();
		});
	});

	describe('Should find default paths on Linux platforms', () => {
		before(() => {
			sinon.stub(process, 'platform').value('LinuxOS');
		});

		// /etc is a system directory, a test cannot place a config file there
		it.skip('readRcConfig should find config in /etc/suitestrc', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test1"}';
			const configPath = path.join('/etc', 'suitestrc');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test1',
					config: configPath,
				},
			);
		});

		it.skip('readRcConfig should find config in /etc/suitest/config', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test2"}';
			const configPath = path.join('/etc', 'suitest', 'config');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test2',
					config: configPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.config/suitest/config', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test3"}';
			const configPath = path.join(process.env.HOME, '.config', 'suitest', 'config');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test3',
					config: configPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.config/suitest', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test4"}';
			const configPath = path.join(process.env.HOME, '.config', 'suitest');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test4',
					config: configPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.suitest/config', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test5"}';
			const configPath = path.join(process.env.HOME, '.suitest', 'config');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test5',
					config: configPath,
				},
			);
		});

		it('readRcConfig should find config in ~/.suitestrc', () => {
			const {readRcConfig} = loadComposeConfig();
			const configContent = '{"test": "test6"}';
			const configPath = path.join(process.env.HOME, '.suitestrc');

			writeConfig(configPath, configContent);

			assert.deepStrictEqual(
				readRcConfig(),
				{
					test: 'test6',
					config: configPath,
				},
			);
		});

		after(() => {
			sinon.restore();
		});
	});

	it('readRcConfig should return empty object', () => {
		const {readRcConfig} = loadComposeConfig();

		assert.deepStrictEqual(readRcConfig(), {});
	});

	it('findExtendConfigs should process correctly', () => {
		const {readConfigFile, findExtendConfigs} = loadComposeConfig();
		const configContentMain = '{"test": "test1"}';
		const configPathMain = path.join(process.cwd(), '.suitestrc.json5');
		const configContentExtended = '{"testExtends": "testExtends"}';
		const configPathExtended = path.join('.', 'fakepath', 'suitestrc.yaml');

		writeConfig(configPathMain, configContentMain);
		writeConfig(configPathExtended, configContentExtended);

		const configFile = readConfigFile(configPathMain);

		assert.deepStrictEqual(
			findExtendConfigs(
				configFile,
				configPathExtended,
				configPathMain,
				[configPathMain],
			),
			{
				testExtends: 'testExtends',
				test: 'test1',
			},
		);
	});
});
