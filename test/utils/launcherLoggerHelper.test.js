const assert = require('assert');
const sinon = require('sinon');
const {mkDirByPathSync, createWriteStream} = require('../../lib/utils/launcherLoggerHelper');
const fs = require('fs');
const path = require('path');

describe('launcherLoggerHelper', () => {
	it('should call mkdirSync with proper arg', () => {
		const mkDir = sinon.stub(fs, 'mkdirSync');
		const sep = sinon.stub(path, 'sep').value('/');

		mkDirByPathSync('./path1/path2');

		assert.equal(mkDir.callCount, 3, 'mkDir called 3 times');
		assert.ok(mkDir.secondCall.args[0].endsWith('path1'), 'second call ends with path1');
		assert.ok(mkDir.thirdCall.args[0].endsWith('path2'), 'third call ends with path2');
		fs.mkdirSync.restore();
		sep.restore();
	});

	it('should call unlinkSync', () => {
		sinon.stub(fs, 'existsSync').callsFake((path) => {
			return path.startsWith('path1/path2');
		});
		const unlinkSync = sinon.stub(fs, 'unlinkSync');

		sinon.stub(fs, 'createWriteStream').callsFake(() => {
			return {on: () => null};
		});

		createWriteStream('path1/path2', '1');

		assert.equal(unlinkSync.callCount, 1, 'unlinkSync called 1 time');
		assert.ok(unlinkSync.firstCall.args[0].includes('path1/path2'), 'first call ends with path1/path2');
		fs.existsSync.restore();
		fs.unlinkSync.restore();
		fs.createWriteStream.restore();
	});

	it('should not call unlinkSync', () => {
		sinon.stub(fs, 'existsSync').callsFake(() => {
			return false;
		});
		const unlinkSync = sinon.stub(fs, 'unlinkSync');

		sinon.stub(fs, 'createWriteStream').callsFake(() => {
			return {on: () => null};
		});

		createWriteStream('path1/path2', '1');

		assert.ok(unlinkSync.called === false, 'unlinkSync called 0 time');
		fs.existsSync.restore();
		fs.unlinkSync.restore();
		fs.createWriteStream.restore();
	});
});
