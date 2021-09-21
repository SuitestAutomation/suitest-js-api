const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');
const mock = require('mock-fs');

const SuitestError = require('../../lib/utils/SuitestError');
const {readUserConfig, readRcConfig} = require('../../lib/testLauncher/composeConfig');

describe('testLauncher readUserConfig', () => {
	it('readUserConfig method should process config file correctly', () => {
		const configObj = {test: true};

		sinon.stub(fs, 'readFileSync').returns(JSON.stringify(configObj));

		try {
			assert.deepEqual(readUserConfig(''), configObj, 'parsed successfully');
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readUserConfig method should throw correct errors', () => {
		assert.throws(
			() => readUserConfig('./__non-such-dir__/__non-such-file__.json'),
			err => err.type === SuitestError.type,
			'falied to read file'
		);

		sinon.stub(fs, 'readFileSync').returns('invalid json');

		try {
			assert.throws(
				() => readUserConfig(''),
				err => err.type === SuitestError.type,
				'falied to parse json'
			);
		} finally {
			fs.readFileSync.restore();
		}
	});

	it('readRcConfig should return corresponding result when argument was past', () => {
		const CONFIG_CONTENT = '{"test": "test"}';
		const MOCK_PATH = './fakepath/.suitestrc';

		mock({
			[MOCK_PATH]: CONFIG_CONTENT,
		});

		try {
			assert.deepEqual(
				readRcConfig(MOCK_PATH),
				{
					test: 'test',
					configs: [MOCK_PATH],
					config: MOCK_PATH,
				},
			);
		} finally {
			mock.restore();
		}
	});

	it('readRcConfig should return corresponding result without any arguments', () => {
		const CONFIG_CONTENT = '{"test": "test"}';
		const MOCK_PATH = `${process.cwd()}\\.suitestrc`;

		mock({
			[MOCK_PATH]: CONFIG_CONTENT,
		});

		try {
			assert.deepEqual(
				readRcConfig(),
				{
					test: 'test',
					configs: [MOCK_PATH],
					config: MOCK_PATH,
				},
			);
		} finally {
			mock.restore();
		}
	});

	it('readRcConfig should return empty object', () => {
		try {
			assert.deepEqual(readRcConfig(), {});
		} finally {
			mock.restore();
		}
	});
});

