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
		const configContent = '{"test": "test"}';
		const mockPath = './fakepath/.suitestrc';

		mock({
			[mockPath]: configContent,
		});

		try {
			assert.deepEqual(
				readRcConfig(mockPath),
				{
					test: 'test',
					configs: [mockPath],
					config: mockPath,
				},
			);
		} finally {
			mock.restore();
		}
	});

	it('readRcConfig should return corresponding result without any arguments', () => {
		const configContent = '{"test": "test"}';
		const mockPath = `${process.cwd()}\\.suitestrc`;

		mock({
			[mockPath]: configContent,
		});

		try {
			assert.deepEqual(
				readRcConfig(),
				{
					test: 'test',
					configs: [mockPath],
					config: mockPath,
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

